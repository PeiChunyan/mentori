// frontend/src/components/auth/LoginPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, NewUserResponse, AuthResponse } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import EmailAuthFlow from './EmailAuthFlow';
import RoleSelection from './RoleSelection';
import SuccessScreen from './SuccessScreen';

type AuthStep = 'login' | 'verify-code' | 'select-role' | 'success';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [provider, setProvider] = useState<'email' | 'google' | 'apple'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState('');
  const [authData, setAuthData] = useState<AuthResponse | null>(null);

  const checkProfileAndRedirect = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.status === 200) {
        // Profile exists, go to dashboard
        router.push('/dashboard');
      } else {
        // No profile, go to create profile
        router.push('/profile/create');
      }
    } catch (err) {
      // Error checking profile, go to create
      router.push('/profile/create');
    }
  };

  const handleAuthSuccess = (data: AuthResponse) => {
    authStorage.saveToken(data.token);
    authStorage.saveUser(data.user);
    setAuthData(data);
    setStep('success');
    
    // Check if profile exists and redirect accordingly
    setTimeout(() => {
      checkProfileAndRedirect();
    }, 2000); // Show success screen for 2 seconds, then redirect
  };

  const handleSendCode = async (emailAddress: string) => {
    setEmail(emailAddress);
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendVerificationCode(emailAddress);
      if (response.status === 200) {
        setProvider('email');
        setStep('verify-code');
      } else {
        setError(response.error?.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (verificationCode: string) => {
    setCode(verificationCode);
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.verifyCode(email, verificationCode);

      if (response.status === 202) {
        // New user - show role selection
        const data = response.data as NewUserResponse;
        setProvider(data.provider as 'email' | 'google' | 'apple');
        setStep('select-role');
      } else if (response.status === 200) {
        // Existing user or new user with role
        handleAuthSuccess(response.data as AuthResponse);
      } else {
        setError(response.error?.message || 'Verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (role: 'mentor' | 'mentee') => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.verifyCode(email, code, role);

      if (response.status === 200) {
        handleAuthSuccess(response.data as AuthResponse);
      } else {
        setError(response.error?.message || 'Failed to create account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.oauthLogin('google', credential);

      if (response.status === 202) {
        // New user - show role selection
        const data = response.data as NewUserResponse;
        setEmail(data.email);
        setPendingToken(credential);
        setProvider('google');
        setStep('select-role');
      } else if (response.status === 200) {
        handleAuthSuccess(response.data as AuthResponse);
      } else {
        setError(response.error?.message || 'Google login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSuccess = async (credential: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.oauthLogin('apple', credential);

      if (response.status === 202) {
        // New user - show role selection
        const data = response.data as NewUserResponse;
        setEmail(data.email);
        setPendingToken(credential);
        setProvider('apple');
        setStep('select-role');
      } else if (response.status === 200) {
        handleAuthSuccess(response.data as AuthResponse);
      } else {
        setError(response.error?.message || 'Apple login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRoleSelection = async (role: 'mentor' | 'mentee') => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.oauthLogin(provider as 'google' | 'apple', pendingToken, role);

      if (response.status === 200) {
        handleAuthSuccess(response.data as AuthResponse);
      } else {
        setError(response.error?.message || 'Failed to create account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success' && authData) {
    return <SuccessScreen user={authData.user} token={authData.token} />;
  }

  if (step === 'select-role') {
    return (
      <RoleSelection
        email={email}
        provider={provider}
        loading={loading}
        onRoleSelect={provider === 'email' ? handleRoleSelection : handleOAuthRoleSelection}
      />
    );
  }

  if (step === 'verify-code') {
    return (
      <EmailAuthFlow
        email={email}
        step="verify-code"
        loading={loading}
        error={error}
        onVerifyCode={handleVerifyCode}
        onBack={() => setStep('login')}
      />
    );
  }

  return (
    <EmailAuthFlow
      step="login"
      loading={loading}
      error={error}
      onSendCode={handleSendCode}
      onGoogleSuccess={handleGoogleSuccess}
      onAppleSuccess={handleAppleSuccess}
    />
  );
}
