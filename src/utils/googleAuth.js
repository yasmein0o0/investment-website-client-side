import { GoogleOAuthProvider, googleLogout, useGoogleLogin } from '@react-oauth/google';

// Google OAuth configuration
export const googleConfig = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    onSuccess: (response) => console.log('Login Success:', response),
    onFailure: (response) => console.log('Login Failed:', response),
    scope: 'profile email',
};

// Hook for Google login
export const useGoogleAuth = (onSuccess, onError) => {
    return useGoogleLogin({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        onSuccess: (tokenResponse) => {
            console.log('Google Auth Success:', tokenResponse);
            if (onSuccess) onSuccess(tokenResponse);
        },
        onError: (error) => {
            console.error('Google Auth Error:', error);
            if (onError) onError(error);
        },
        scope: 'profile email',
    });
};

// Function to get user info from Google
export const getGoogleUserInfo = async (accessToken) => {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info from Google');
        }

        const userInfo = await response.json();
        return userInfo;
    } catch (error) {
        console.error('Error fetching Google user info:', error);
        throw error;
    }
};

// Logout function
export const googleLogoutUser = () => {
    googleLogout();
    localStorage.removeItem('google_token');
    localStorage.removeItem('google_user');
};