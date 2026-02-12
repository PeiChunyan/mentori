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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Demo Environment</h2>
            <p className="text-sm text-gray-500">For Demonstration Purposes Only</p>
          </div>

          <div className="space-y-4 mb-6 text-left">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important Notice</h3>
              <p className="text-yellow-700 text-sm">
                This is a <strong>demonstration version</strong> of Mentori Network. This is a pivot prototype to showcase features and functionality.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <h3 className="font-bold text-blue-800 mb-2">🔒 No Data Collection</h3>
              <p className="text-blue-700 text-sm">
                <strong>No personal data is collected, stored, or transmitted.</strong> All profiles, messages, and interactions are simulated for demonstration only.
              </p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
              <h3 className="font-bold text-purple-800 mb-2">🎭 Simulated Experience</h3>
              <p className="text-purple-700 text-sm">
                All mentors, mentees, and messages are fictional. Login does not require credentials. Nothing you do here is real or permanent.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <h3 className="font-bold text-green-800 mb-2">✅ What You Can Do</h3>
              <ul className="text-green-700 text-sm list-disc list-inside space-y-1">
                <li>Browse mentor and mentee profiles</li>
                <li>See how the messaging feature would work</li>
                <li>Explore the user interface and features</li>
                <li>Test the platform functionality</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleAcknowledgeDisclaimer}
              className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-500 hover:to-pink-600 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              I Understand - Continue to Demo
            </button>
            <p className="text-xs text-gray-500 mt-3">
              By continuing, you acknowledge this is a demonstration only
            </p>
          </div>
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
