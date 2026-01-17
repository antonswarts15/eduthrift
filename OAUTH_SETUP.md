# OAuth Setup Guide

This guide explains how to set up Google and Facebook authentication for the Eduthrift application.

## Google OAuth Setup

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure the consent screen if prompted
   - Choose "Web application" as the application type
   - Add authorized origins: `http://localhost:3000`, `http://localhost:8080`
   - Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`

4. **Update Environment Variables:**
   - Copy the Client ID from Google Cloud Console
   - Update `frontEnd/eduthrift/.env`:
     ```
     REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
     ```
   - Update `backEnd/.env`:
     ```
     GOOGLE_CLIENT_ID=your-google-client-id-here
     ```

## Facebook OAuth Setup

1. **Create a Facebook App:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "Create App" and choose "Consumer" type
   - Enter app name and contact email

2. **Configure Facebook Login:**
   - In your app dashboard, go to "Products" and add "Facebook Login"
   - In Facebook Login settings, add valid OAuth redirect URIs:
     - `http://localhost:3000/`
     - `http://localhost:8080/auth/facebook/callback`

3. **Get App Credentials:**
   - Go to "Settings" > "Basic"
   - Copy the App ID and App Secret

4. **Update Environment Variables:**
   - Update `frontEnd/eduthrift/.env`:
     ```
     REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id-here
     ```
   - Update `backEnd/.env`:
     ```
     FACEBOOK_APP_ID=your-facebook-app-id-here
     FACEBOOK_APP_SECRET=your-facebook-app-secret-here
     ```

## Testing OAuth Integration

1. **Start the application:**
   ```bash
   cd frontEnd
   docker-compose up -d
   ```

2. **Access the login page:**
   - Navigate to `http://localhost:3000`
   - Go to the Login/Register page
   - You should see "Continue with Google" and "Continue with Facebook" buttons

3. **Test the flow:**
   - Click on either social login button
   - Complete the OAuth flow in the popup
   - You should be redirected to the home page upon successful authentication

## Database Schema Updates

The database schema has been updated to support OAuth authentication:

- Added `google_id` field to store Google user IDs
- Added `facebook_id` field to store Facebook user IDs
- Made `password_hash` nullable for social login users
- Added indexes for OAuth ID fields

## Security Notes

- Never commit actual OAuth credentials to version control
- Use environment variables for all sensitive configuration
- In production, update redirect URIs to use your actual domain
- Consider implementing additional security measures like CSRF protection
- Regularly rotate OAuth secrets

## Troubleshooting

**Google Login Issues:**
- Ensure the Google+ API is enabled
- Check that the client ID matches exactly
- Verify authorized origins and redirect URIs

**Facebook Login Issues:**
- Ensure the app is not in development mode for production use
- Check that redirect URIs are correctly configured
- Verify the app has the necessary permissions (email)

**General Issues:**
- Check browser console for JavaScript errors
- Verify environment variables are loaded correctly
- Ensure the backend API endpoints are accessible