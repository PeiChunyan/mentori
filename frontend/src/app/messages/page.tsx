'use client';

import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = authStorage.getUser();
    if (!savedUser) {
      router.push('/auth');
      return;
    }
    setUser(savedUser);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-100 border-b-2 border-yellow-300 py-2 px-4 text-center">
        <p className="text-sm text-yellow-800">
          🎭 <strong>DEMO MODE</strong> - This is a demonstration. No real data is collected or stored.
        </p>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mentori Network</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/mentors')}
              className="font-medium text-gray-600 hover:text-gray-900"
            >
              Browse
            </button>
            <button
              onClick={() => {
                authStorage.clear();
                router.push('/auth');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <span className="text-6xl">💬</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Messages (Demo)
          </h2>
          <p className="text-gray-600 mb-4">
            In the full version, you would be able to send and receive messages with mentors or mentees.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">📌 Demo Notice</h3>
            <p className="text-blue-700 text-sm">
              Messaging is a key feature of the full platform. Users can:
            </p>
            <ul className="text-left text-blue-700 text-sm mt-3 space-y-2">
              <li>✓ Send direct messages to mentors or mentees</li>
              <li>✓ Schedule video calls or in-person meetings</li>
              <li>✓ Share resources and documents</li>
              <li>✓ Receive notifications for new messages</li>
              <li>✓ Keep a history of all conversations</li>
            </ul>
            <p className="text-blue-600 text-xs mt-4">
              <strong>Remember:</strong> This is a demonstration. No messages are actually sent or stored.
            </p>
          </div>
          <button
            onClick={() => router.push('/mentors')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Browse Profiles
          </button>
        </div>
      </main>
    </div>
  );
}
