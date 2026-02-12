import React from 'react';
import { useRouter } from 'next/navigation';

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

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="text-center space-y-4">
      <div className="text-green-500 text-6xl mb-4">✓</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome!
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        You're logged in as {user.role}
      </p>
      
      <button
        onClick={handleContinue}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
      >
        Continue to Dashboard
      </button>
    </div>
  );
}
