# Google Calendar API Integration Setup Guide for Mosphere

This guide explains how to connect your real Google Calendar to the **Mosphere Appointment Booking Platform** using Google Cloud Service Account credentials.

---

## 📋 Overview of the Flow

```
[Customer Books on Mosphere Website]
               │
               ▼
[Mosphere Node.js Backend] (Server-Side)
               │ (Authenticates with Service Account Private Key)
               ▼
[Google Calendar API v3]
               │
               ▼
[Mosphere Owner's Google Calendar]
  ✨ Event: "Mosphere Appointment - {Customer Name}"
  ✨ Start/End: Real-time duration calculated
  ✨ Real-time Busy Slot Blocking & Anti-Double-Booking
```

---

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account (the one associated with your salon or business).
3. Click the project dropdown at the top and select **"New Project"**.
4. Name your project (e.g. `mosphere-booking-system`) and click **"Create"**.
5. Make sure your new project is selected from the top dropdown.

---

## Step 2: Enable the Google Calendar API

1. In the Google Cloud Console, open the navigation menu (☰) and go to **"APIs & Services" > "Library"**.
2. In the search box, type **"Google Calendar API"**.
3. Click on **"Google Calendar API"** from the search results.
4. Click the blue **"Enable"** button.

---

## Step 3: Create a Service Account & Download Credentials

1. Open the navigation menu and go to **"APIs & Services" > "Credentials"**.
2. Click **"+ CREATE CREDENTIALS"** at the top and select **"Service Account"**.
3. Fill in the details:
   - **Service account name**: `mosphere-calendar-bot`
   - **Service account ID**: `mosphere-calendar-bot` (auto-filled)
   - **Description**: `Server-side bot to manage Mosphere appointments`
4. Click **"Create and Continue"**.
5. (Optional) Role: Select **"Owner"** or **"Editor"** (or leave default), then click **"Continue"**, and click **"Done"**.
6. On the Credentials page, look under **"Service Accounts"** and click on your newly created service account email (e.g., `mosphere-calendar-bot@<project-id>.iam.gserviceaccount.com`).
7. **Copy this email address** — you will need it in Step 4.
8. Go to the **"Keys"** tab at the top.
9. Click **"ADD KEY" > "Create new key"**.
10. Select **"JSON"** format and click **"Create"**.
11. A `.json` key file will automatically download to your computer. Keep this file secure and private!

---

## Step 4: Share Your Google Calendar with the Service Account

1. Open [Google Calendar](https://calendar.google.com/) in your browser.
2. In the left sidebar, find the calendar you want to use for Mosphere appointments (either your primary personal calendar or create a dedicated calendar called **"Mosphere Appointments"** by clicking `+` next to "Other calendars" > "Create new calendar").
3. Hover over the calendar name, click the **three vertical dots (⋮)**, and select **"Settings and sharing"**.
4. Scroll down to the **"Share with specific people or groups"** section.
5. Click **"+ Add people and groups"**.
6. In the email field, paste your **Service Account email** from Step 3 (e.g. `mosphere-calendar-bot@<project-id>.iam.gserviceaccount.com`).
7. Under **Permissions**, choose **"Make changes to events"** (This is crucial so the bot can create, update, and cancel appointments).
8. Click **"Send"**.

---

## Step 5: Get Your Calendar ID

1. In the same **"Settings and sharing"** page of your calendar, scroll down to the **"Integrate calendar"** section.
2. Find the **"Calendar ID"** field:
   - For your primary calendar, it is usually your email (e.g. `owner@mosphere.com` or `primary`).
   - For a dedicated secondary calendar, it will look like `c_xxxxxxxxx@group.calendar.google.com`.
3. Copy this Calendar ID.

---

## Step 6: Configure Environment Variables

Open the `.env` file in the root of the `mos websit` directory and populate your credentials:

### Option A: Direct Environment Variables (Recommended for cloud hosting)

```env
# Google Calendar ID from Step 5
GOOGLE_CALENDAR_ID="c_xxxxxxxxxxxxxx@group.calendar.google.com"

# Service Account Email from Step 3
GOOGLE_SERVICE_ACCOUNT_EMAIL="mosphere-calendar-bot@your-project-id.iam.gserviceaccount.com"

# Service Account Private Key from the downloaded JSON file
# Note: Keep the quotes and include \n for linebreaks
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### Option B: Local JSON Key File

1. Copy the downloaded `.json` key file into the project root (e.g. `service-account-key.json`).
2. Add to `.env`:
```env
GOOGLE_CALENDAR_ID="c_xxxxxxxxxxxxxx@group.calendar.google.com"
GOOGLE_KEY_FILE_PATH="./service-account-key.json"
```

> **Security Note**: Never commit your `.env` or `service-account-key.json` file to public Git repositories! Both are listed in `.gitignore`.

---

## Step 7: Test & Verify the Live Integration

1. Start your Mosphere server:
   ```bash
   npm start
   ```
2. Open the **Admin Dashboard**: `http://localhost:3000/admin.html`
3. Login using default admin credentials:
   - **Username**: `admin`
   - **Password**: `adminPassword123`
4. Go to the **"Google Calendar"** tab.
5. Click **"Test Live Connection"**.
6. You should see a green badge: **"Connected"** along with your calendar's name and timezone!
7. Make a test booking on `http://localhost:3000`. You will immediately see the appointment appear on your Google Calendar app with all customer details!

---

## 🛠️ Troubleshooting Common Issues

| Problem | Cause | Solution |
|---|---|---|
| `404 Not Found` | Incorrect Calendar ID or Calendar not shared with bot | Double check the Calendar ID in `.env` and verify Step 4. |
| `403 Forbidden` | Insufficient permissions on Google Calendar | In Google Calendar sharing settings, ensure the bot has **"Make changes to events"**, not just "See only free/busy". |
| `Invalid PEM formatted private key` | Line breaks missing in `GOOGLE_PRIVATE_KEY` | Ensure `\n` is preserved or use `GOOGLE_KEY_FILE_PATH="./service-account-key.json"`. |
