// frontend/src/components/Dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url: string;
  expertise: string[];
  interests: string[];
  location: string;
  is_active: boolean;
}

interface RecommendedMentor extends Profile {
  user_id: string;
  matchScore?: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recommendedMentors, setRecommendedMentors] = useState<RecommendedMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Derived values
  const isDashboard = pathname === '/dashboard';
  const isMentors = pathname === '/mentors';

  // Calculate profile completion percentage
  const calculateProfileCompletion = (prof: Profile | null): number => {
    if (!prof) return 0;
    
    let completionScore = 0;
    const maxScore = 100;
    let filledFields = 0;
    const totalFields = 6;

    // First name (15 points)
    if (prof.first_name) filledFields++;
    
    // Last name (15 points)
    if (prof.last_name) filledFields++;
    
    // Bio (15 points)
    if (prof.bio) filledFields++;
    
    // Location (15 points)
    if (prof.location) filledFields++;
    
    // Expertise (20 points)
    if (prof.expertise?.length > 0) filledFields++;
    
    // Interests (20 points)
    if (prof.interests?.length > 0) filledFields++;
    
    completionScore = Math.round((filledFields / totalFields) * maxScore);
    return completionScore;
  };

  useEffect(() => {
    const savedUser = authStorage.getUser();
    const savedToken = authStorage.getToken();

    if (!savedUser || !savedToken) {
      router.push('/auth');
      return;
    }

    setUser(savedUser);
    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.status === 200) {
        setProfile(response.data);
        // Load recommended mentors after profile is loaded
        await loadRecommendedMentors(response.data);
      }
    } catch (err) {
      setError('Failed to load profile');
      // Use mock mentors for testing if profile load fails
      setRecommendedMentors(MOCK_MENTORS);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedMentors = async (userProfile: Profile) => {
    try {
      // Search for mentors with matching expertise or interests
      const searchQuery = {
        expertise: userProfile.expertise?.[0] || '',
        interests: userProfile.interests?.[0] || '',
        limit: 3,
      };

      const results = await apiClient.searchProfiles(searchQuery);
      
      // Filter out current user and calculate match scores
      const mentors = results
        .filter((m: any) => m.id !== userProfile.id)
        .map((mentor: any) => ({
          ...mentor,
          matchScore: calculateMatchScore(userProfile, mentor),
        }))
        .sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 3);

      setRecommendedMentors(mentors);
    } catch (err) {
      console.log('Failed to load recommended mentors');
    }
  };

  const calculateMatchScore = (userProfile: Profile, mentorProfile: Profile): number => {
    let score = 0;
    
    // Expertise match
    const expertiseMatch = mentorProfile.expertise?.filter((e) =>
      userProfile.interests?.includes(e)
    ).length || 0;
    score += expertiseMatch * 25;

    // Interest match
    const interestMatch = mentorProfile.interests?.filter((i) =>
      userProfile.interests?.includes(i)
    ).length || 0;
    score += interestMatch * 20;

    // Location match
    if (userProfile.location && mentorProfile.location === userProfile.location) {
      score += 15;
    }

    return score;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    authStorage.clear();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mentori</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className={`font-medium transition-colors ${
                isDashboard
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-2'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Dashboard
            </button>
            <button
              onClick={() => router.push('/mentors')}
              className={`font-medium transition-colors ${
                isMentors
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-2'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {user?.role === 'mentor' ? 'Browse Mentees' : 'Browse Mentors'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile ? `${profile.first_name} ${profile.last_name}` : user.email}! 👋
          </h2>
          <p className="text-gray-600">You are logged in as a <strong className="capitalize text-blue-600">{user.role}</strong></p>
        </div>

        {/* Quick Stats */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">0</div>
                <p className="text-gray-600 text-sm mt-1">Active Mentorships</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <p className="text-gray-600 text-sm mt-1">Pending Requests</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <p className="text-gray-600 text-sm mt-1">Messages</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {calculateProfileCompletion(profile)}%
                </div>
                <p className="text-gray-600 text-sm mt-1">Profile Complete</p>
              </div>
            </div>
          </div>
        )}

        {/* Account Info & Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-gray-600 text-sm">Email</dt>
                <dd className="text-gray-900 font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-gray-600 text-sm">Role</dt>
                <dd className="text-gray-900 font-medium capitalize">{user.role}</dd>
              </div>
              <div>
                <dt className="text-gray-600 text-sm">Member Since</dt>
                <dd className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {profile ? (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-gray-600 text-sm">Name</dt>
                  <dd className="text-gray-900 font-medium text-lg">
                    {profile.first_name} {profile.last_name}
                  </dd>
                </div>
                {profile.location && (
                  <div>
                    <dt className="text-gray-600 text-sm">Location</dt>
                    <dd className="text-gray-900 font-medium">📍 {profile.location}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-600 text-sm">Skills</dt>
                  <dd className="text-gray-900 font-medium">{profile.expertise?.length || 0} expertise areas</dd>
                </div>
              </dl>
              <button
                onClick={() => router.push('/profile/create')}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-indigo-100 mb-6">
                Set up your profile to unlock personalized mentor recommendations and start your mentorship journey!
              </p>
              <button
                onClick={() => router.push('/profile/create')}
                className="w-full bg-white text-indigo-600 py-3 rounded-lg hover:bg-gray-100 font-bold text-lg transition-all"
              >
                Create Profile Now
              </button>
            </div>
          )}
        </div>

        {/* Recommended Mentors Section */}
        {profile && recommendedMentors.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-gray-900">
                {user?.role === 'mentor' ? 'Potential Mentees' : 'Recommended Mentors'}
              </h3>
              <p className="text-gray-600 mt-1">Perfectly matched to your interests</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedMentors.map((mentor) => (
                <div key={mentor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {mentor.avatar_url && (
                          <img
                            src={mentor.avatar_url}
                            alt={mentor.first_name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {mentor.first_name} {mentor.last_name}
                          </h4>
                          {mentor.location && (
                            <p className="text-sm text-gray-600">📍 {mentor.location}</p>
                          )}
                        </div>
                      </div>
                      {mentor.matchScore && (
                        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2">
                          {mentor.matchScore}% ✓
                        </div>
                      )}
                    </div>

                    {mentor.bio && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{mentor.bio}</p>
                    )}

                    {mentor.expertise && mentor.expertise.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Expertise</p>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.slice(0, 2).map((exp) => (
                            <span key={exp} className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => router.push('/mentors')}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Details - Only show for users without profile */}
        {!profile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-900">Your profile details will appear here once you create your profile.</p>
          </div>
        )}
      </main>
    </div>
  );
}
