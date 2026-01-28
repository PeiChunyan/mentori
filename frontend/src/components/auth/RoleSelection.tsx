// frontend/src/components/auth/RoleSelection.tsx
'use client';

interface RoleSelectionProps {
  email: string;
  provider: 'email' | 'google' | 'apple';
  loading: boolean;
  onRoleSelect: (role: 'mentor' | 'mentee') => void;
}

export default function RoleSelection({ email, provider, loading, onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Welcome! 🎉</h2>
        <p className="text-gray-600 text-center mb-2">
          <strong>{email}</strong>
        </p>
        <p className="text-gray-600 text-center mb-8">
          Choose your role to get started
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onRoleSelect('mentor')}
            disabled={loading}
            className="w-full p-6 border-2 border-blue-500 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
          >
            <div className="text-2xl mb-2">🎓</div>
            <div className="text-xl font-semibold text-gray-900">I'm a Mentor</div>
            <div className="text-sm text-gray-600">Share my knowledge and experience</div>
          </button>

          <button
            onClick={() => onRoleSelect('mentee')}
            disabled={loading}
            className="w-full p-6 border-2 border-green-500 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-left"
          >
            <div className="text-2xl mb-2">🌱</div>
            <div className="text-xl font-semibold text-gray-900">I'm a Mentee</div>
            <div className="text-sm text-gray-600">Learn from experienced mentors</div>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          You can change your role later in settings
        </p>
      </div>
    </div>
  );
}
