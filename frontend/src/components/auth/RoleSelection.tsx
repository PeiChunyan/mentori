import React from 'react';

interface RoleSelectionProps {
  email: string;
  provider: 'email' | 'google' | 'apple' | null;
  loading: boolean;
  onRoleSelect: (role: 'mentor' | 'mentee') => void;
}

export default function RoleSelection({ email, provider, loading, onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        Choose Your Role
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        Welcome {email}! Are you looking to mentor others or seeking guidance?
      </p>
      
      <div className="space-y-3 mt-6">
        <button
          onClick={() => onRoleSelect('mentor')}
          disabled={loading}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Setting up...' : 'I want to be a Mentor'}
        </button>
        
        <button
          onClick={() => onRoleSelect('mentee')}
          disabled={loading}
          className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Setting up...' : "I'm looking for a Mentor"}
        </button>
      </div>
    </div>
  );
}
