'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi, ProfilesApi, ModelsProfile, ModelsUpdateProfileRequest, ModelsCreateProfileRequest, ModelsUserResponse } from '../../api';

export default function ProfilePage() {
  const [user, setUser] = useState<ModelsUserResponse | null>(null);
  const [profile, setProfile] = useState<ModelsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    timezone: '',
    linkedin_url: '',
    website_url: '',
    avatar_url: '',
    expertise: [] as string[],
    interests: [] as string[],
    is_active: true,
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const config = new Configuration({ accessToken: token });
      const authApi = new AuthApi(config);
      const response = await authApi.authProfileGet();
      setUser(response.data);

      // If user has a profile, load it
      if (response.data.profile) {
        setProfile(response.data.profile);
        setFormData({
          first_name: response.data.profile.first_name || '',
          last_name: response.data.profile.last_name || '',
          bio: response.data.profile.bio || '',
          location: response.data.profile.location || '',
          timezone: response.data.profile.timezone || '',
          linkedin_url: response.data.profile.linkedin_url || '',
          website_url: response.data.profile.website_url || '',
          avatar_url: response.data.profile.avatar_url || '',
          expertise: response.data.profile.expertise || [],
          interests: response.data.profile.interests || [],
          is_active: response.data.profile.is_active ?? true,
        });
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const config = new Configuration({ accessToken: token });
      const profilesApi = new ProfilesApi(config);

      if (profile) {
        // Update existing profile
        const updateRequest: ModelsUpdateProfileRequest = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          location: formData.location,
          timezone: formData.timezone,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          avatar_url: formData.avatar_url,
          expertise: formData.expertise,
          interests: formData.interests,
          is_active: formData.is_active,
        };

        const response = await profilesApi.profilesPut(updateRequest);
        setProfile(response.data);
      } else {
        // Create new profile
        const createRequest: ModelsCreateProfileRequest = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          location: formData.location,
          timezone: formData.timezone,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          avatar_url: formData.avatar_url,
          expertise: formData.expertise,
          interests: formData.interests,
          is_active: formData.is_active,
        };

        const response = await profilesApi.profilesPost(createRequest);
        setProfile(response.data);
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        timezone: profile.timezone || '',
        linkedin_url: profile.linkedin_url || '',
        website_url: profile.website_url || '',
        avatar_url: profile.avatar_url || '',
        expertise: profile.expertise || [],
        interests: profile.interests || [],
        is_active: profile.is_active ?? true,
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (field: 'expertise' | 'interests', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load user information</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profile ? 'My Profile' : 'Create Profile'}
            </h1>
            {profile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile?.first_name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile?.last_name || 'Not set'}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profile?.bio || 'No bio yet'}</p>
              )}
            </div>

            {/* Location and Timezone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Helsinki, Finland"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile?.location || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Europe/Helsinki"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile?.timezone || 'Not set'}</p>
                )}
              </div>
            </div>

            {/* Role-specific fields */}
            {user.role === 'mentor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expertise (comma-separated)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.expertise.join(', ')}
                    onChange={(e) => handleArrayInputChange('expertise', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {profile?.expertise?.length ? profile.expertise.join(', ') : 'No expertise listed'}
                  </p>
                )}
              </div>
            )}

            {user.role === 'mentee' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interests (comma-separated)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.interests.join(', ')}
                    onChange={(e) => handleArrayInputChange('interests', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Web Development, Machine Learning"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {profile?.interests?.length ? profile.interests.join(', ') : 'No interests listed'}
                  </p>
                )}
              </div>
            )}

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn URL
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {profile?.linkedin_url ? (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.linkedin_url}
                      </a>
                    ) : 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website URL
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {profile?.website_url ? (
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website_url}
                      </a>
                    ) : 'Not set'}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}