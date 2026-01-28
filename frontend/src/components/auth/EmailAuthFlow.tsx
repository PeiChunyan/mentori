// frontend/src/components/auth/EmailAuthFlow.tsx
'use client';

import { useState, useEffect } from 'react';

interface EmailAuthFlowProps {
  step: 'login' | 'verify-code';
  email?: string;
  loading: boolean;
  error: string | null;
  onSendCode?: (email: string) => void;
  onVerifyCode?: (code: string) => void;
  onGoogleSuccess?: (credential: string) => void;
  onAppleSuccess?: (credential: string) => void;
  onBack?: () => void;
}

export default function EmailAuthFlow({
  step,
  email = '',
  loading,
  error,
  onSendCode,
  onVerifyCode,
  onGoogleSuccess,
  onAppleSuccess,
  onBack,
}: EmailAuthFlowProps) {
  const [inputEmail, setInputEmail] = useState(email);
  const [inputCode, setInputCode] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    if (step === 'login' && typeof window !== 'undefined') {
      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleLoaded(true);
      document.head.appendChild(script);

      return () => {
        // Cleanup
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [step]);

  if (step === 'verify-code') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Check your email</h2>
          <p className="text-gray-600 text-center mb-6">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onVerifyCode?.(inputCode);
            }}
          >
            <input
              type="text"
              placeholder="000000"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full mb-4 p-3 border rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              disabled={loading}
              required
            />

            <button
              type="submit"
              disabled={loading || inputCode.length !== 6}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to login
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Didn't receive a code? Check spam folder or request a new one
          </p>
        </div>
      </div>
    );
  }

  // Login step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">Mentori</h1>
        <p className="text-gray-600 text-center mb-8">Sign in to continue</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendCode?.(inputEmail);
          }}
        >
          <input
            type="email"
            placeholder="your@email.com"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? 'Sending...' : 'Continue with Email'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <GoogleButton 
            disabled={loading || !googleLoaded} 
            onSuccess={onGoogleSuccess}
          />
          <AppleButton disabled={true} onClick={() => {}} />
          <p className="text-xs text-gray-400 text-center">Apple OAuth coming soon</p>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}

function GoogleButton({ disabled, onSuccess }: { disabled: boolean; onSuccess?: (credential: string) => void }) {
  const buttonRef = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !onSuccess) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response.credential);
          }
        },
      });

      if (buttonRef[0]) {
        window.google.accounts.id.renderButton(buttonRef[0], {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        });
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  }, [onSuccess, buttonRef]);

  if (!onSuccess) {
    return (
      <button
        disabled={true}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="font-medium text-gray-700">Google</span>
      </button>
    );
  }

  return (
    <div 
      ref={(el) => { buttonRef[1](el); }}
      className={disabled ? 'opacity-50 pointer-events-none' : ''}
    />
  );
}

function AppleButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      <span className="font-medium text-gray-700">Apple</span>
    </button>
  );
}
