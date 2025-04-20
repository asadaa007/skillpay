# ImgBB Integration for SkillPay

This document provides instructions on how to set up and use ImgBB for image uploads in the SkillPay application.

## What is ImgBB?

ImgBB is a free image hosting service that provides an API for uploading images. It's a good alternative to Firebase Storage for handling image uploads in your application.

## Setting Up ImgBB

1. **Create an ImgBB account**:
   - Visit [ImgBB](https://imgbb.com/) and sign up for a free account.

2. **Get your API key**:
   - After signing up, go to your account settings.
   - Look for the "API" section and copy your API key.

3. **Add the API key to your environment variables**:
   - Open the `.env` file in your project root.
   - Add the following line, replacing `your_imgbb_api_key_here` with your actual API key:
     ```
     VITE_IMGBB_API_KEY=your_imgbb_api_key_here
     ```

## How It Works in SkillPay

The SkillPay application now uses ImgBB for image uploads when creating or editing gigs. Here's how it works:

1. When a user selects images for a gig, the application will upload them to ImgBB.
2. ImgBB will return URLs for the uploaded images.
3. These URLs are stored in the gig document in Firestore.

## Benefits of Using ImgBB

- **No CORS issues**: ImgBB's API is designed to work with web applications and doesn't have the same CORS restrictions as Firebase Storage.
- **Free tier**: ImgBB offers a free tier that includes a generous amount of storage and bandwidth.
- **Simple API**: ImgBB's API is straightforward and easy to use.

## Limitations

- **Rate limits**: ImgBB's free tier has rate limits on API calls.
- **Storage limits**: There are limits on the total amount of storage you can use.
- **No user-specific folders**: Unlike Firebase Storage, ImgBB doesn't provide user-specific folders out of the box.

## Troubleshooting

If you encounter issues with ImgBB uploads:

1. Check that your API key is correct in the `.env` file.
2. Verify that you haven't exceeded ImgBB's rate or storage limits.
3. Check the browser console for any error messages.
4. Ensure your images aren't too large (ImgBB has file size limits).

## Switching Back to Firebase Storage

If you decide to switch back to Firebase Storage in the future:

1. Update the `handleSubmit` function in `src/pages/Gigs.jsx` to use Firebase Storage instead of ImgBB.
2. Remove the ImgBB API key from your `.env` file.
3. Follow the instructions in `FIREBASE_CORS_SETUP.md` to configure CORS for Firebase Storage. 