// frontend/src/components/auth/SuccessScreen.tsx
'use client';

import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

interface SuccessScreenProps {
  user: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  };
  token: string;
}

export default function SuccessScreen({ user, token }: SuccessScreenProps) {
  const router = useRouter();

  const handleLogout = () => {
    authStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h2>
          <p className="text-gray-600">Welcome to Mentori, {user.role}!</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
            <p className="text-gray-900 font-medium break-all">{user.email}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Role</p>
            <p className="text-gray-900 font-medium capitalize">{user.role}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">User ID</p>
            <p className="text-gray-900 font-mono text-xs break-all">{user.id}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">JWT Token</p>
            <div className="bg-white p-2 rounded border border-gray-200 mt-1">
              <p className="text-gray-900 font-mono text-xs break-all overflow-y-auto max-h-24">
                {token}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(token);
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Copy Token
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-gray-700 border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Logout
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          ✨ You're authenticated! Start using the app.
        </p>
      </div>
    </div>
  );
}
