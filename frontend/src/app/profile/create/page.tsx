'use client';

import { useRouter } from 'next/navigation';

export default function CreateProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Demo Banner */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
        <div className="max-w-3xl mx-auto flex items-center">
          <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">Demo Mode - Profile Creation Disabled</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Creation</h1>
            <p className="text-lg text-gray-600 mb-6">
              Not available in demo version
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">🎭 Demo Mode Restrictions</h2>
            <p className="text-gray-700 mb-4">
              This is a demonstration version of the platform. Profile creation and editing features are disabled to showcase the platform's capabilities with pre-populated data.
            </p>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Browse 40 demo profiles (20 mentors & 20 mentees)</span>
              </p>
              <p className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>View detailed profile information</span>
              </p>
              <p className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Explore the messaging interface</span>
              </p>
              <p className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span>Create or edit your own profile</span>
              </p>
              <p className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <span>Send real messages or communications</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => router.push('/mentors')}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Browse Demo Profiles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
