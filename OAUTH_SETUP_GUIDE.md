# 🔑 OAuth Client ID Setup Guide - Complete Tutorial

## Overview
This guide will walk you through getting OAuth credentials from Google, Facebook, and Apple to enable 1-click social login on your restaurant website.

**Time Required:** ~30-45 minutes total  
**Cost:** FREE for all three providers  
**Difficulty:** Beginner-friendly with screenshots references

---

## 🔵 1. Google OAuth Setup (10-15 minutes)

### **Step 1: Go to Google Cloud Console**
1. Open your browser
2. Go to: **https://console.cloud.google.com**
3. Sign in with your Google account

### **Step 2: Create a New Project**
1. Click the project dropdown (top left, next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Enter project details:
   - **Project name:** `MrHappy-Restaurant`
   - **Organization:** Leave as default
4. Click **"CREATE"**
5. Wait 10-20 seconds for project creation
6. Select your new project from the dropdown

### **Step 3: Enable Google Sign-In API**
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. In the search box, type: `Google+ API` or `Google Sign-In`
3. Click on **"Google+ API"**
4. Click **"ENABLE"** button
5. Wait for it to enable (~5 seconds)

### **Step 4: Configure OAuth Consent Screen**
1. Click **"OAuth consent screen"** in left sidebar
2. Choose **"External"** (for public users)
3. Click **"CREATE"**

4. Fill out App Information:
   ```
   App name: Mr Happy Restaurant
   User support email: your-email@example.com
   App logo: (optional - upload your restaurant logo)
   ```

5. Fill out Developer Contact:
   ```
   Email addresses: your-email@example.com
   ```

6. Click **"SAVE AND CONTINUE"**

7. **Scopes** page:
   - Click **"ADD OR REMOVE SCOPES"**
   - Select these scopes:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

8. **Test users** (optional - for testing before going live):
   - Click **"ADD USERS"**
   - Enter your email
   - Click **"SAVE AND CONTINUE"**

9. Review and click **"BACK TO DASHBOARD"**

### **Step 5: Create OAuth Client ID**
1. Click **"Credentials"** in left sidebar
2. Click **"+ CREATE CREDENTIALS"** (top)
3. Select **"OAuth client ID"**

4. Fill out details:
   ```
   Application type: Web application
   Name: Mr Happy Web Client
   ```

5. **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Add: `http://localhost:5173` (for development with Vite)
   - Click **"+ ADD URI"** again
   - Add: `https://your-domain.com` (for production)
   
6. **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Add: `http://localhost:5173`
   - Click **"+ ADD URI"** again
   - Add: `https://your-domain.com`

7. Click **"CREATE"**

### **Step 6: Get Your Client ID**
You'll see a popup with your credentials:

```
Your Client ID:
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com

Your Client Secret:
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

**IMPORTANT:** 
- ✅ Copy the **Client ID** - You need this!
- ✅ Copy the **Client Secret** - Keep it safe!
- 📝 Save both to a secure note

### **Step 7: Add to Your Project**
Create a file: `.env.local` in your project root:

```env
REACT_APP_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Security Note:** Never commit `.env.local` to git!

---

## 🟦 2. Facebook OAuth Setup (10-15 minutes)

### **Step 1: Go to Facebook Developers**
1. Open your browser
2. Go to: **https://developers.facebook.com**
3. Sign in with your Facebook account
4. Click **"Get Started"** if this is your first time

### **Step 2: Create an App**
1. Click **"My Apps"** (top right)
2. Click **"Create App"**
3. Choose use case:
   - Select **"Consumer"** or **"Other"**
   - Click **"Next"**

4. Fill out app details:
   ```
   App name: Mr Happy Restaurant
   App contact email: your-email@example.com
   ```

5. Click **"Create App"**
6. Complete security check if prompted

### **Step 3: Add Facebook Login Product**
1. From your app dashboard, scroll down
2. Find **"Facebook Login"** card
3. Click **"Set Up"**
4. Choose **"Web"** as platform

5. Enter your site URL:
   ```
   Site URL: http://localhost:5173
   ```
6. Click **"Save"**
7. Click **"Continue"**
8. Skip the remaining quick start steps

### **Step 4: Configure Facebook Login Settings**
1. In left sidebar, expand **"Facebook Login"**
2. Click **"Settings"**

3. Fill out OAuth settings:
   ```
   Client OAuth Login: YES (toggle on)
   Web OAuth Login: YES (toggle on)
   
   Valid OAuth Redirect URIs:
   http://localhost:5173
   https://your-domain.com
   
   Deauthorize Callback URL: (optional)
   Data Deletion Request URL: (optional)
   ```

4. Click **"Save Changes"** (bottom)

### **Step 5: Make App Public (for production)**
1. Click **"Settings"** → **"Basic"** in left sidebar
2. Scroll down to **"App Mode"**
3. Currently shows: **"Development"**
4. Toggle to **"Live"** when ready for production
   - Note: Keep in Development for testing
   - You'll need to add a Privacy Policy URL first

### **Step 6: Get Your App ID**
1. Click **"Settings"** → **"Basic"**
2. You'll see:
   ```
   App ID: 123456789012345
   App Secret: [Click "Show"] abcdef123456789
   ```

**IMPORTANT:**
- ✅ Copy the **App ID** - You need this!
- ✅ Click "Show" and copy **App Secret** - Keep it safe!

### **Step 7: Add to Your Project**
Add to your `.env.local` file:

```env
REACT_APP_FACEBOOK_APP_ID=123456789012345
REACT_APP_FACEBOOK_APP_SECRET=abcdef123456789
```

### **Step 8: Add App Domains**
1. Still in **Settings** → **Basic**
2. Find **"App Domains"**
3. Add:
   ```
   localhost
   your-domain.com
   ```
4. Click **"Save Changes"**

---

## ⚫ 3. Apple Sign In Setup (15-20 minutes)

**Prerequisites:**
- ✅ Apple Developer Account ($99/year)
- ✅ Your domain name

### **Step 1: Join Apple Developer Program**
1. Go to: **https://developer.apple.com/programs/**
2. Click **"Enroll"**
3. Sign in with your Apple ID
4. Complete enrollment (requires payment)
5. Wait for approval (usually instant)

### **Step 2: Register Your App ID**
1. Go to: **https://developer.apple.com/account/**
2. Click **"Certificates, Identifiers & Profiles"**
3. Click **"Identifiers"** in left sidebar
4. Click the **"+"** button (next to Identifiers)

5. Select **"App IDs"**
6. Click **"Continue"**

7. Fill out details:
   ```
   Description: Mr Happy Restaurant Web
   Bundle ID: com.mrhappy.webapp
   ```

8. Scroll down to **"Capabilities"**
9. Check ✅ **"Sign in with Apple"**
10. Click **"Continue"**
11. Click **"Register"**

### **Step 3: Create Services ID**
1. Click **"Identifiers"** again
2. Click the **"+"** button
3. Select **"Services IDs"**
4. Click **"Continue"**

5. Fill out details:
   ```
   Description: Mr Happy Restaurant Web Service
   Identifier: com.mrhappy.webapp.service
   ```

6. Check ✅ **"Sign in with Apple"**
7. Click **"Configure"** next to Sign in with Apple

8. In the popup:
   ```
   Primary App ID: (select the App ID you created)
   
   Domains and Subdomains:
   your-domain.com
   
   Return URLs:
   https://your-domain.com/auth/apple/callback
   ```

9. Click **"Save"**
10. Click **"Continue"**
11. Click **"Register"**

### **Step 4: Create a Key**
1. Click **"Keys"** in left sidebar
2. Click the **"+"** button

3. Fill out details:
   ```
   Key Name: Mr Happy Apple Sign In Key
   ```

4. Check ✅ **"Sign in with Apple"**
5. Click **"Configure"** next to it
6. Select your Primary App ID
7. Click **"Save"**
8. Click **"Continue"**
9. Click **"Register"**

### **Step 5: Download Your Key**
⚠️ **IMPORTANT:** You can only download this ONCE!

1. Click **"Download"**
2. Save the file: `AuthKey_XXXXXXXXX.p8`
3. Note your **Key ID** (10 characters, shown on screen)

### **Step 6: Get Your Team ID**
1. Go back to: **https://developer.apple.com/account/**
2. Look at the top right
3. You'll see your **Team ID** (10 characters)

### **Step 7: Add to Your Project**
Add to your `.env.local` file:

```env
REACT_APP_APPLE_CLIENT_ID=com.mrhappy.webapp.service
REACT_APP_APPLE_TEAM_ID=ABCDEFGHIJ
REACT_APP_APPLE_KEY_ID=XXXXXXXXXX
REACT_APP_APPLE_REDIRECT_URI=https://your-domain.com/auth/apple/callback
```

**Also save:**
- The `.p8` key file in a secure location
- Never commit it to git!

---

## 🔐 Security Best Practices

### **1. Environment Variables**
Create `.env.local` in your project root:

```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Facebook OAuth  
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id_here

# Apple Sign In
REACT_APP_APPLE_CLIENT_ID=your_apple_client_id_here
REACT_APP_APPLE_TEAM_ID=your_apple_team_id_here
REACT_APP_APPLE_KEY_ID=your_apple_key_id_here
REACT_APP_APPLE_REDIRECT_URI=https://your-domain.com/auth/apple/callback
```

### **2. Add to .gitignore**
Ensure your `.gitignore` includes:

```
.env.local
.env.development.local
.env.test.local
.env.production.local
*.p8
```

### **3. Never Expose Secrets**
- ✅ Client IDs are OK to expose (public)
- ❌ Client Secrets must stay private
- ❌ Private keys (.p8) must stay private
- ❌ Never commit secrets to GitHub

---

## 📝 Quick Reference Checklist

### **Google:**
- [ ] Create project in Google Cloud Console
- [ ] Enable Google Sign-In API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth Client ID
- [ ] Get Client ID
- [ ] Add to .env.local

### **Facebook:**
- [ ] Create app in Facebook Developers
- [ ] Add Facebook Login product
- [ ] Configure OAuth redirect URIs
- [ ] Get App ID
- [ ] Add to .env.local

### **Apple:**
- [ ] Join Apple Developer Program ($99/year)
- [ ] Create App ID with Sign in with Apple
- [ ] Create Services ID
- [ ] Create and download Key (.p8)
- [ ] Get Team ID and Key ID
- [ ] Add to .env.local

---

## 🧪 Testing Your Setup

### **Test Mode:**
All three providers start in "development/test" mode:
- ✅ Works on `localhost:5173` (Vite default port)
- ✅ Free to test
- ✅ No users see it yet

### **Before Going Live:**

1. **Google:**
   - Verify OAuth consent screen
   - Add production URLs
   - Submit for verification (optional)

2. **Facebook:**
   - Switch from Development to Live mode
   - Add Privacy Policy URL
   - Add Terms of Service URL
   - Complete App Review if needed

3. **Apple:**
   - Already live once configured
   - Add production domain
   - Test on actual domain

---

## 🚀 Production Deployment

### **Update URLs:**
When you deploy to production:

1. **Google Cloud Console:**
   - Add: `https://your-domain.com` to Authorized origins
   - Add: `https://your-domain.com` to Redirect URIs

2. **Facebook Developers:**
   - Add: `https://your-domain.com` to Valid OAuth Redirect URIs
   - Add: `your-domain.com` to App Domains

3. **Apple Developer:**
   - Add: `your-domain.com` to Domains and Subdomains
   - Add: `https://your-domain.com/auth/apple/callback` to Return URLs

### **Environment Variables:**
Create `.env.production` with production URLs:

```env
REACT_APP_GOOGLE_CLIENT_ID=same_as_development
REACT_APP_FACEBOOK_APP_ID=same_as_development
REACT_APP_APPLE_CLIENT_ID=same_as_development
REACT_APP_APPLE_REDIRECT_URI=https://your-domain.com/auth/apple/callback
```

---

## ❓ Troubleshooting

### **Google: "redirect_uri_mismatch"**
**Solution:** 
- Check your Authorized redirect URIs exactly match
- Include `http://` or `https://`
- No trailing slashes

### **Facebook: "URL Blocked"**
**Solution:**
- Add domain to "App Domains" in Basic Settings
- Add URL to "Valid OAuth Redirect URIs"
- Make sure App is not in Development mode for production

### **Apple: "invalid_client"**
**Solution:**
- Verify Services ID matches your configuration
- Check Team ID and Key ID are correct
- Ensure .p8 key file is valid
- Confirm Return URLs are exact matches

---

## 💰 Costs

| Provider | Development | Production |
|----------|-------------|------------|
| **Google** | FREE | FREE |
| **Facebook** | FREE | FREE |
| **Apple** | FREE* | $99/year |

*Apple requires Developer Program membership

---

## 📧 Support Links

- **Google:** https://support.google.com/cloud/
- **Facebook:** https://developers.facebook.com/support/
- **Apple:** https://developer.apple.com/support/

---

## ✅ Summary

After following this guide, you'll have:

1. ✅ Google OAuth Client ID
2. ✅ Facebook App ID
3. ✅ Apple Services ID + Keys
4. ✅ All credentials in `.env.local`
5. ✅ Ready for testing
6. ✅ Ready for production deployment

**Estimated Setup Time:** 30-45 minutes  
**Difficulty:** Beginner-friendly  
**Cost:** Free (except Apple: $99/year)

---

## 🎉 Next Steps

Once you have all credentials:

1. ✅ Add them to `.env.local`
2. ✅ Restart your development server
3. ✅ Test each OAuth button
4. ✅ Verify login works
5. ✅ Deploy to production
6. ✅ Update production URLs
7. ✅ Monitor and enjoy faster signups!

**Your users will love the 1-click login experience!** 🚀
