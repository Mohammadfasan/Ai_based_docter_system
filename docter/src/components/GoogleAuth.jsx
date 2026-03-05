// src/components/GoogleAuth.jsx
import React, { useEffect, useRef, useState } from 'react';

const GoogleAuth = ({ onSuccess, onError, buttonText = "Sign in with Google", userType = "patient" }) => {
  const buttonRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  
  // Get Google Client ID with fallback
  const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || 
                         '937494578810-5teblcmofdnp7p3el5r9pcg2srt343r8.apps.googleusercontent.com';
  
  const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if Google script is already loaded
    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
      setScriptLoaded(true);
      return;
    }

    // Load Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google script loaded successfully');
        setScriptLoaded(true);
        initializeGoogleSignIn();
      };
      script.onerror = (error) => {
        console.error('Failed to load Google script:', error);
        setScriptError(true);
      };
      document.body.appendChild(script);
    };

    // Initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin',
            ux_mode: 'popup',
            itp_support: true,
          });
          
          // Render the button if we have a reference
          if (buttonRef.current) {
            window.google.accounts.id.renderButton(
              buttonRef.current,
              { 
                theme: 'outline', 
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'center',
                width: 250,
                locale: 'en'
              }
            );
          }
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
          setScriptError(true);
        }
      }
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Handle Google response
  const handleGoogleResponse = async (response) => {
    try {
      console.log('Google response received');
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }
      
      // Send credential to backend
      const apiResponse = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
          userType: userType
        })
      });

      const data = await apiResponse.json();

      if (data.success) {
        // Store in sessionStorage
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        sessionStorage.setItem('userType', data.user.userType);
        
        console.log('Google login successful:', data.user);
        onSuccess?.(data.user);
      } else {
        console.error('Google login failed:', data.message);
        onError?.(data.message);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      onError?.(error.message || 'Google authentication failed');
    }
  };

  // Handle manual fallback
  const handleManualClick = () => {
    if (scriptError) {
      alert(
        '⚠️ Google Sign-In script failed to load.\n\n' +
        'This might be due to:\n' +
        '• Ad blocker preventing the script\n' +
        '• Network connectivity issues\n' +
        '• Browser privacy settings\n\n' +
        'Please try:\n' +
        '• Disable ad blocker for this site\n' +
        '• Use incognito/private mode\n' +
        '• Check your internet connection\n' +
        '• Try a different browser'
      );
    } else if (!scriptLoaded) {
      alert('Google Sign-In is still loading. Please wait a moment and try again.');
    } else {
      // Trigger Google Sign-In popup
      window.google?.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full">
      {/* Google Sign-In Button Container */}
      <div 
        ref={buttonRef}
        className="w-full flex justify-center"
        id="google-signin-button"
      />
      
      {/* Manual fallback button if script fails */}
      {scriptError && (
        <button
          onClick={handleManualClick}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          {buttonText}
        </button>
      )}
      
      {/* Status messages */}
      {scriptError && (
        <p className="text-xs text-amber-600 text-center mt-2">
          ⚠️ Google Sign-In script failed to load. Click the button above to retry.
        </p>
      )}
      
      {!scriptLoaded && !scriptError && (
        <p className="text-xs text-gray-500 text-center mt-2 animate-pulse">
          Loading Google Sign-In...
        </p>
      )}
      
      <p className="text-xs text-gray-500 text-center mt-2">
        Secured by Google Authentication
      </p>
    </div>
  );
};

export default GoogleAuth;