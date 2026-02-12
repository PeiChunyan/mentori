'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

export default function DemoLogin() {
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    // Check if user has already acknowledged the disclaimer
    const ack = localStorage.getItem('mentori_demo_ack');
    if (ack === '1') {
      setShowDisclaimer(false);
    }
  }, []);

  const handleRoleSelect = (role: 'mentor' | 'mentee') => {
    // Generate a random demo user
    const demoUser = {
      id: `demo-${role}-${Math.random().toString(36).substr(2, 9)}`,
      email: `demo-${role}@example.com`,
      role: role,
      created_at: new Date().toISOString(),
    };

    // Generate a fake JWT token for demo purposes
    const demoToken = `demo_token_${btoa(JSON.stringify(demoUser))}`;

    // Save to storage (local only, no backend)
    authStorage.saveToken(demoToken);
    authStorage.saveUser(demoUser);

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleAcknowledgeDisclaimer = () => {
    localStorage.setItem('mentori_demo_ack', '1');
    setShowDisclaimer(false);
  };

  if (showDisclaimer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-w-md w-full gap-6 p-6">
          {/* Icon & Title */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Demo Only</h2>
          </div>

          {/* Simple Message */}
          <div className="text-center">
            <p className="text-gray-700 text-sm mb-2">
              This is a demonstration. No real data is collected or stored.
            </p>
            <p className="text-gray-600 text-xs">
              Everything is simulated for testing purposes.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={handleAcknowledgeDisclaimer}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-pink-600 transition shadow-lg active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center px-4 py-6 sm:py-12">
      <div className="w-full max-w-2xl">
        {/* Demo Badge */}
        <div className="text-center mb-4 sm:mb-6">
          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 border-yellow-300">
            🎭 DEMO MODE
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2 sm:mb-3">
            Mentori Network
          </h1>
          <p className="text-sm sm:text-lg text-gray-700">
            Choose your role
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Mentor Card */}
          <div 
            onClick={() => handleRoleSelect('mentor')}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-400 p-6 sm:p-8"
          >
            <div className="text-center">
              <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
                <span className="text-3xl sm:text-5xl">🎓</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Mentor</h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Help newcomers succeed in Finland
              </p>
              <button className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:from-blue-500 hover:to-blue-700 transition">
                Continue
              </button>
            </div>
          </div>

          {/* Mentee Card */}
          <div 
            onClick={() => handleRoleSelect('mentee')}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-pink-400 p-6 sm:p-8"
          >
            <div className="text-center">
              <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
                <span className="text-3xl sm:text-5xl">🌱</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Mentee</h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Get guidance to succeed in Finland
              </p>
              <button className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:from-pink-500 hover:to-pink-700 transition">
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            💡 No account or personal info required
          </p>
        </div>
      </div>
    </div>
  );
}
