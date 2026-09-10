// lib/notifications.ts
// Native Lock Screen & System Notifications for Mosphere Salon

let audioCtx: AudioContext | null = null;

/**
 * Play a high-end luxury dual-tone chime for incoming booking alerts
 */
export function playNotificationChime(): void {
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

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
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

  if (playChime) {
    playNotificationChime();
  }

  const notificationOptions: any = {
    body,
    icon,
    badge,
    tag: tag || `mosphere-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
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
