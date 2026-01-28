'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { authStorage } from '@/lib/auth';

interface MentorProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url: string;
  expertise: string[];
  interests: string[];
  location: string;
  is_active: boolean;
}

// Finnish cities
const FINNISH_CITIES = [
  'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Turku', 'Oulu', 'Jyväskylä',
  'Kuopio', 'Lahti', 'Pori', 'Kouvola', 'Joensuu', 'Lappeenranta',
  'Hämeenlinna', 'Vaasa', 'Rovaniemi', 'Mikkeli', 'Kemi', 'Seinäjoki',
  'Rauma', 'Porvoo', 'Hyvinkää', 'Nurmijärvi', 'Järvenpää', 'Kerava',
];

// Expertise options
const EXPERTISE_OPTIONS = [
  'Find a Job', "Bachelor's Degree", "Master's Degree", 'Doctoral Studies',
  'YKI Test Preparation', 'Finnish Marriage & Family', 'Work-Life Balance',
  'Starting a Business', 'Housing & Relocation', 'Finnish Language Learning',
  'Healthcare System', 'Education System', 'Banking & Finance',
  'Integration & Culture', 'Networking & Socializing',
];

// Interest options
const INTEREST_OPTIONS = [
  'Reading & Books', 'Bars & Nightlife', 'Musical Instruments', 'Hiking & Outdoor',
  'Indoor Sports', 'Gym & Fitness', 'Winter Sports', 'Board Games',
  'Coffee Culture', 'Foodie & Restaurants', 'Arts & Museums', 'Tech & Gaming',
  'Music & Concerts', 'Photography', 'Crafts & DIY', 'Movies & TV Shows',
  'Cooking & Baking', 'Traveling', 'Cycling', 'Running',
];

export default function MentorDiscovery() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);

  // Filters
  const [expertise, setExpertise] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  // UI State
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');

  useEffect(() => {
    const savedUser = authStorage.getUser();
    setUser(savedUser);
    if (savedUser) {
      fetchMentors(undefined, savedUser);
    }
  }, []);

  const fetchMentors = async (filters?: any, currentUser?: any) => {
    setLoading(true);
    setError(null);
    try {
      // Use provided user or fall back to state user
      const activeUser = currentUser || user;
      // If current user is mentor, show mentees; if mentee, show mentors
      const targetRole = activeUser?.role === 'mentor' ? 'mentee' : 'mentor';
      
      const response = await apiClient.searchProfiles({
        role: targetRole,
        ...filters,
      });

      if (response.status === 200) {
        setMentors(response.data || []);
      } else {
        setError(response.error?.message || `Failed to load ${targetRole}s`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const filters: any = {};

    if (expertise.length > 0) {
      filters.expertise = expertise;
    }
    if (location) {
      filters.location = location;
    }
    if (interests.length > 0) {
      filters.interests = interests;
    }

    await fetchMentors(filters);
  };

  const addExpertiseFilter = () => {
    if (selectedExpertise && !expertise.includes(selectedExpertise)) {
      setExpertise([...expertise, selectedExpertise]);
      setSelectedExpertise('');
    }
  };

  const removeExpertiseFilter = (item: string) => {
    setExpertise(expertise.filter((e) => e !== item));
  };

  const addInterestFilter = () => {
    if (selectedInterest && !interests.includes(selectedInterest)) {
      setInterests([...interests, selectedInterest]);
      setSelectedInterest('');
    }
  };

  const removeInterestFilter = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleLogout = () => {
    authStorage.clear();
    router.push('/auth');
  };

  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';
  const isMentors = pathname === '/mentors';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {user?.role === 'mentor' ? 'Find Mentees' : 'Find Your Mentor'}
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Search & Filter</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All locations</option>
                {FINNISH_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
              <div className="flex gap-2">
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select expertise...</option>
                  {EXPERTISE_OPTIONS.filter(opt => !expertise.includes(opt)).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addExpertiseFilter}
                  disabled={!selectedExpertise}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              <div className="flex gap-2">
                <select
                  value={selectedInterest}
                  onChange={(e) => setSelectedInterest(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select interest...</option>
                  {INTEREST_OPTIONS.filter(opt => !interests.includes(opt)).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addInterestFilter}
                  disabled={!selectedInterest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Display active filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {location && (
              <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-sm text-purple-900">📍 {location}</span>
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </div>
            )}
            {expertise.map((item) => (
              <div key={item} className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-sm text-blue-900">{item}</span>
                <button
                  type="button"
                  onClick={() => removeExpertiseFilter(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
            ))}
            {interests.map((item) => (
              <div key={item} className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                <span className="text-sm text-green-900">{item}</span>
                <button
                  type="button"
                  onClick={() => removeInterestFilter(item)}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Search Mentors
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No mentors found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedMentor(mentor)}
              >
                {mentor.avatar_url && (
                  <img
                    src={mentor.avatar_url}
                    alt={`${mentor.first_name} ${mentor.last_name}`}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {mentor.first_name} {mentor.last_name}
                  </h3>

                  {mentor.location && <p className="text-sm text-gray-600 mb-2">📍 {mentor.location}</p>}

                  {mentor.bio && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{mentor.bio}</p>
                  )}

                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.slice(0, 3).map((exp) => (
                          <span key={exp} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {exp}
                          </span>
                        ))}
                        {mentor.expertise.length > 3 && (
                          <span className="text-xs text-gray-600">+{mentor.expertise.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {mentor.interests && mentor.interests.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">Interests:</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.interests.slice(0, 3).map((interest) => (
                          <span key={interest} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {interest}
                          </span>
                        ))}
                        {mentor.interests.length > 3 && (
                          <span className="text-xs text-gray-600">+{mentor.interests.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for selected mentor */}
        {selectedMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    {selectedMentor.avatar_url && (
                      <img
                        src={selectedMentor.avatar_url}
                        alt={`${selectedMentor.first_name} ${selectedMentor.last_name}`}
                        className="h-20 w-20 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedMentor.first_name} {selectedMentor.last_name}
                      </h2>
                      {selectedMentor.location && <p className="text-gray-600">📍 {selectedMentor.location}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMentor(null)}
                    className="text-2xl text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {selectedMentor.bio && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-700">{selectedMentor.bio}</p>
                  </div>
                )}

                {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.expertise.map((exp) => (
                        <span key={exp} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMentor.interests && selectedMentor.interests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.interests.map((interest) => (
                        <span key={interest} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                  Request Mentorship
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
