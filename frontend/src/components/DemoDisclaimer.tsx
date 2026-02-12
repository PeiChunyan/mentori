// DemoDisclaimer.tsx
'use client';

import React from 'react';

export default function DemoDisclaimer() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Demo Environment</h2>
        <p className="mb-4 text-gray-700">
          <strong>This is a demonstration version of Mentori Network.</strong><br />
          No data is collected, stored, or transmitted. All users, mentors, and mentees are simulated. Messaging and login are for preview only.
        </p>
        <p className="mb-4 text-gray-500 text-sm">
          By continuing, you acknowledge this is a pivot demo and not a real service. No personal information is required or retained.
        </p>
        <button
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('mentori_demo_ack', '1');
              window.location.reload();
            }
          }}
        >
          Continue to Demo
        </button>
      </div>
    </div>
  );
}
