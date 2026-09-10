// lib/notifications.ts
// Native Lock Screen & System Notifications for Mosphere Salon

let audioCtx: AudioContext | null = null;
let lastChimePlayedAt = 0;

/**
 * Play a high-end luxury dual-tone chime for incoming booking alerts
 * Throttled to never play more than once every 4 seconds
 */
export function playNotificationChime(): void {
  const nowMs = Date.now();
  if (nowMs - lastChimePlayedAt < 4000) {
    return;
  }
  lastChimePlayedAt = nowMs;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Tone 1: High crisp gold chime (E6 ~ 1318.5 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.9);

    // Tone 2: Harmonious ring (B6 ~ 1975.5 Hz) delayed by 120ms
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.5, now + 0.12);
    gain2.gain.setValueAtTime(0.28, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.warn('Audio chime notice:', err);
  }
}

/**
 * Register Service Worker for lock screen and background notifications
 */
export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const swUrl = `${basePath}/sw.js`;
  const scope = basePath ? `${basePath}/` : '/';

  try {
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope,
    });
    return registration;
  } catch (err) {
    console.warn('Service worker registration notice:', err);
    return null;
  }
}

/**
 * Check if notifications are currently permitted
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request OS & Browser permission to show notifications on the lock screen
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    // Also register service worker concurrently
    await registerNotificationServiceWorker();

    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      // Prime audio context on user gesture
      playNotificationChime();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export interface LockScreenNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  icon?: string;
  badge?: string;
  playChime?: boolean;
}

const recentNotificationTags = new Map<string, number>();

/**
 * Send a native notification that displays directly on the device Lock Screen & Action Center
 */
export async function sendLockScreenNotification({
  title,
  body,
  tag,
  url = '/admin',
  icon = '/apple-touch-icon.png',
  badge = '/images/mosphere-emblem-gold.png',
  playChime = true,
}: LockScreenNotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  // Deduplicate rapid duplicate calls with the same tag (within 15 seconds)
  const effectiveTag = tag || 'mosphere-booking-latest';
  const nowMs = Date.now();
  const lastSent = recentNotificationTags.get(effectiveTag) || 0;
  if (nowMs - lastSent < 15000) {
    return false;
  }
  recentNotificationTags.set(effectiveTag, nowMs);

  // Clean memory periodically
  if (recentNotificationTags.size > 200) {
    for (const [k, t] of recentNotificationTags.entries()) {
      if (nowMs - t > 60000) recentNotificationTags.delete(k);
    }
  }

  if (playChime) {
    playNotificationChime();
  }

  const notificationOptions: any = {
    body,
    icon,
    badge,
    tag: effectiveTag,
    renotify: false,
    requireInteraction: false,
    silent: false,
    // Vibration pattern wakes phone and alerts on lock screen
    // 300ms vibrate, 100ms pause, 300ms vibrate, 100ms pause, 500ms vibrate
    vibrate: [300, 100, 300, 100, 500],
    data: { url },
  };

  try {
    // Prefer service worker registration because it stays alive when screen is locked
    if ('serviceWorker' in navigator) {
      let reg: ServiceWorkerRegistration | null | undefined = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await registerNotificationServiceWorker();
      }
      if (reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    }

    // Fallback to standard Window Notification
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      if (url && typeof window !== 'undefined') {
        window.location.href = url;
      }
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('Native notification trigger notice:', err);
    return false;
  }
}

const DEFAULT_VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BGzWKJ8VD6koWDYTAw5bU7Y4d3nNa-t3p6Rg5n1J2w4LXV_Agvra4M98N-ODk8uxoEbO7NA_4xMEeSZjjRdn3S0';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the current browser has an active PushSubscription registered with OS Push Service
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    return Boolean(sub);
  } catch (e) {
    return false;
  }
}

/**
 * Subscribes this device to OS-level Lock Screen Web Push notifications.
 * This allows alerts to arrive EVEN WHEN the browser/tab is completely closed and phone is locked!
 */
export async function subscribeToLockScreenPush(): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Push notifications are not supported by this browser.' };
  }

  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    return { success: false, error: 'Notification permission denied.' };
  }

  try {
    let reg: ServiceWorkerRegistration | null | undefined = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = (await registerNotificationServiceWorker()) ?? undefined;
    }
    if (!reg) {
      return { success: false, error: 'Service worker registration failed.' };
    }

    // Ensure service worker is active
    if (!reg.active) {
      await navigator.serviceWorker.ready;
    }

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const convertedVapidKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      });
    }

    const subJson = sub.toJSON();

    // 1. Send to Backend API
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subJson }),
      });
    } catch (e) {
      console.warn('API push subscription sync notice:', e);
    }

    // 2. Direct Sync to Cloud Firestore (so it works on static GitHub Pages hosting too!)
    try {
      const { db } = await import('./firebase');
      const { collection, addDoc, getDocs } = await import('firebase/firestore');
      if (db && subJson.endpoint) {
        const snap = await getDocs(collection(db, 'push_subscriptions'));
        let found = false;
        snap.forEach((d) => {
          if (d.data().endpoint === subJson.endpoint) found = true;
        });
        if (!found) {
          await addDoc(collection(db, 'push_subscriptions'), {
            endpoint: subJson.endpoint,
            p256dh: subJson.keys?.p256dh || '',
            auth: subJson.keys?.auth || '',
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (fsErr) {
      console.warn('Firestore push subscription sync notice:', fsErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error subscribing to push:', err);
    return { success: false, error: err.message || 'Push subscription failed.' };
  }
}

/**
 * Triggers a push broadcast to all subscribed admin devices
 */
export async function triggerPushNotificationToAll(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (e) {
    console.warn('Trigger push notice:', e);
    return false;
  }
}

