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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Demo Badge */}
        <div className="text-center mb-6">
          <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold border-2 border-yellow-300">
            🎭 DEMO MODE - No Real Data
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-3">
            Welcome to Mentori Network
          </h1>
          <p className="text-lg text-gray-700">
            Choose your role to explore the demo
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Mentor Card */}
          <div 
            onClick={() => handleRoleSelect('mentor')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-400"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-5xl">🎓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Mentor</h2>
              <p className="text-gray-600 mb-4">
                I want to help newcomers and share my knowledge about living in Finland
              </p>
              <ul className="text-sm text-gray-500 text-left space-y-2 mb-6">
                <li>✓ Browse mentee profiles</li>
                <li>✓ See who needs guidance</li>
                <li>✓ View demo messaging</li>
                <li>✓ Explore mentor features</li>
              </ul>
              <button className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-blue-700 transition">
                Continue as Mentor
              </button>
            </div>
          </div>

          {/* Mentee Card */}
          <div 
            onClick={() => handleRoleSelect('mentee')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-pink-400"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-5xl">🌱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Mentee</h2>
              <p className="text-gray-600 mb-4">
                I'm looking for guidance and support to succeed in Finland
              </p>
              <ul className="text-sm text-gray-500 text-left space-y-2 mb-6">
                <li>✓ Browse mentor profiles</li>
                <li>✓ Find experienced guides</li>
                <li>✓ View demo messaging</li>
                <li>✓ Explore mentee features</li>
              </ul>
              <button className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-lg font-semibold hover:from-pink-500 hover:to-pink-700 transition">
                Continue as Mentee
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            💡 This is a demonstration. No account creation or personal information required.
          </p>
        </div>
      </div>
    </div>
  );
}
