# PES Tracking HUB — Tasks, Calendar, Habits & Projects

A dark mode productivity and life management system featuring:
- **Task Management**: Daily to-dos with priorities, subtasks, due dates, and categories.
- **Google Calendar**: Real-time read-only sync of upcoming schedule, meeting links, and agendas.
- **Clubs & Organizations**: Tracking commitments, leadership roles, meeting locations, and announcements.
- **Personal Habit Tracker**: 7-day consistency matrix with streak calculations and local storage persistence.
- **Long-Term Project Goals**: Milestone checklists, roadmaps, and progress tracking.
- **Markdown Notes**: Rich editor and live preview with basic Markdown syntax support and local persistence.
- **Full Data Backup**: Instant JSON export and restore.

---

## 🚀 Deploying to Vercel

This app is built with **Vite** and **React** and is pre-configured for one-click deployment on **Vercel** with `vercel.json` SPA routing.

### Method 1: Deploy with Git & Vercel Dashboard (Recommended)

1. **Push this project to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Initial commit for PES Tracking HUB"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository.
   - Vercel will auto-detect the configuration:
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Click **Deploy**.

3. *(Optional)* **Set Environment Variables on Vercel**:
   If you wish to configure your own Firebase project credentials rather than using the default config, add these in your Vercel Project Settings > Environment Variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

---

### Method 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

### 🔑 Google Calendar OAuth on Your Vercel Domain

When your app is deployed at `https://<your-project>.vercel.app`:

1. Open your [Firebase Console](https://console.firebase.google.com/) for project `gen-lang-client-0144927225`.
2. Go to **Authentication** > **Settings** > **Authorized Domains**.
3. Click **Add domain** and enter your Vercel deployment domain (e.g. `your-app.vercel.app`).
4. (If using custom domain): Also add your custom domain there and in the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) under OAuth 2.0 Client IDs -> Authorized JavaScript origins.
