# Firebase Storage CORS Configuration

This document provides instructions on how to fix the CORS (Cross-Origin Resource Sharing) issues with Firebase Storage.

## The Problem

When uploading images to Firebase Storage from your local development server (http://localhost:3000), you may encounter CORS errors like:

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/skillpay-f62df.firebasestorage...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

This happens because Firebase Storage's default CORS configuration doesn't allow requests from localhost.

## Solution

### Option 1: Using the provided script (Recommended)

1. Make sure you have the Firebase CLI installed:
   ```
   npm install -g firebase-tools
   ```

2. Make the setup script executable:
   ```
   chmod +x setup-cors.sh
   ```

3. Run the script:
   ```
   ./setup-cors.sh
   ```

4. Follow the prompts to log in to Firebase and apply the CORS configuration.

### Option 2: Manual setup

1. Install the Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Install the Google Cloud SDK which includes the `gsutil` command:
   - Visit: https://cloud.google.com/sdk/docs/install

4. Apply the CORS configuration:
   ```
   gsutil cors set cors.json gs://skillpay-f62df.appspot.com
   ```

## Temporary Workaround

If you can't immediately apply the CORS configuration, the application has been updated to handle image upload failures gracefully. It will:

1. Try to upload each image
2. If an image fails to upload, it will show an error message but continue with the gig creation
3. The gig will be created with any successfully uploaded images

## Verifying the Fix

After applying the CORS configuration:

1. Wait a few minutes for the changes to take effect
2. Try uploading images again
3. Check the browser console for any CORS errors

If you still encounter issues, you may need to:

1. Clear your browser cache
2. Restart your development server
3. Check if your Firebase project has any additional security rules that might be blocking uploads 