// src/components/GoogleSignIn.js
import React from "react";
import { auth, provider, signInWithPopup } from "../firebaseConfig";

const GoogleSignIn = () => {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User signed in:", user);
      // Save user info in your app (state, context, etc.)
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300"
    >
      <svg
        className="w-5 h-5 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 4 24s8.955 16 20 16c11.045 0 20-8.955 20-20 0-5.319-2.239-10.05-6.389-13.611z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.829C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 4 24s8.955 16 20 16c11.045 0 20-8.955 20-20 0-5.319-2.239-10.05-6.389-13.611z"
        />
        <path
          fill="#4CAF50"
          d="M6.306 33.208l6.571-4.819C14.655 32.892 18.961 36 24 36c3.059 0 5.842-1.154 7.961-3.039l5.657 5.657C34.046 41.947 29.268 44 24 44 12.955 44 4 35.045 4 35.045 4 24s8.955-16 20-16c11.045 0 20 8.955 20 20 0 5.319-2.239 10.05-6.389 13.611z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a11.993 11.993 0 0 1-2.682 5.993c0 .538.04 1.057.115 1.555l.003.009 6.364 5.532a23.916 23.916 0 0 1-6.389 6.389l-.003-.009a11.993 11.993 0 0 1-5.993-2.682H24v-8h11.303a11.993 11.993 0 0 1 2.682-5.993c.076-.5.115-1.019.115-1.555z"
        />
      </svg>
      Sign in with Google
    </button>
  );
};

export default GoogleSignIn;
