'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface ProfileFormProps {
  initialData?: any;
  onSuccess?: (profile: any) => void;
  isEditing?: boolean;
}

// Finnish cities
const FINNISH_CITIES = [
  'Helsinki',
  'Espoo',
  'Tampere',
  'Vantaa',
  'Turku',
  'Oulu',
  'Jyväskylä',
  'Kuopio',
  'Lahti',
  'Pori',
  'Kouvola',
  'Joensuu',
  'Lappeenranta',
  'Hämeenlinna',
  'Vaasa',
  'Rovaniemi',
  'Mikkeli',
  'Kemi',
  'Seinäjoki',
  'Rauma',
  'Porvoo',
  'Hyvinkää',
  'Nurmijärvi',
  'Järvenpää',
  'Kerava',
];

// Expertise options
const EXPERTISE_OPTIONS = [
  'Find a Job',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctoral Studies',
  'YKI Test Preparation',
  'Finnish Marriage & Family',
  'Work-Life Balance',
  'Starting a Business',
  'Housing & Relocation',
  'Finnish Language Learning',
  'Healthcare System',
  'Education System',
  'Banking & Finance',
  'Integration & Culture',
  'Networking & Socializing',
];

// Interest options
const INTEREST_OPTIONS = [
  'Reading & Books',
  'Bars & Nightlife',
  'Musical Instruments',
  'Hiking & Outdoor',
  'Indoor Sports',
  'Gym & Fitness',
  'Winter Sports',
  'Board Games',
  'Coffee Culture',
  'Foodie & Restaurants',
  'Arts & Museums',
  'Tech & Gaming',
  'Music & Concerts',
  'Photography',
  'Crafts & DIY',
  'Movies & TV Shows',
  'Cooking & Baking',
  'Traveling',
  'Cycling',
  'Running',
];

export default function ProfileForm({ initialData, onSuccess, isEditing = false }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.first_name || '',
    lastName: initialData?.last_name || '',
    bio: initialData?.bio || '',
    location: initialData?.location || '',
    expertise: initialData?.expertise || [],
    interests: initialData?.interests || [],
    avatarURL: initialData?.avatar_url || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addExpertise = () => {
    if (selectedExpertise && !formData.expertise.includes(selectedExpertise)) {
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, selectedExpertise],
      }));
      setSelectedExpertise('');
    }
  };

  const removeExpertise = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((e) => e !== item),
    }));
  };

  const addInterest = () => {
    if (selectedInterest && !formData.interests.includes(selectedInterest)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, selectedInterest],
      }));
      setSelectedInterest('');
    }
  };

  const removeInterest = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== item),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        bio: formData.bio,
        location: formData.location,
        expertise: formData.expertise,
        interests: formData.interests,
        avatar_url: formData.avatarURL,
      };

      let response;
      if (isEditing) {
        response = await apiClient.updateProfile(payload);
      } else {
        response = await apiClient.createProfile(payload);
      }

      console.log('Profile save response:', { status: response.status, data: response.data, error: response.error });

      if (response.status === 200 || response.status === 201) {
        onSuccess?.(response.data);
      } else {
        // Extract error message from various possible formats
        let errorMsg = 'Failed to save profile';
        if (response.error?.message) {
          errorMsg = response.error.message;
        } else if (response.error?.error) {
          errorMsg = response.error.error;
        } else if (typeof response.error === 'string') {
          errorMsg = response.error;
        } else if (response.data?.error) {
          errorMsg = response.data.error;
        }
        setError(errorMsg);
        console.error('Profile save error (status:', response.status, '):', response.error, 'data:', response.data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      console.error('Profile save exception:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {isEditing ? 'Edit Profile' : 'Create Profile'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a city...</option>
          {FINNISH_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
        <input
          type="url"
          name="avatarURL"
          value={formData.avatarURL}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/avatar.jpg"
        />
        {formData.avatarURL && (
          <img src={formData.avatarURL} alt="Preview" className="mt-2 h-20 w-20 rounded-full object-cover" />
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
        <div className="flex gap-2 mb-2">
          <select
            value={selectedExpertise}
            onChange={(e) => setSelectedExpertise(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select expertise area...</option>
            {EXPERTISE_OPTIONS.filter(opt => !formData.expertise.includes(opt)).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addExpertise}
            disabled={!selectedExpertise}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.expertise.map((item) => (
            <div key={item} className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-sm text-blue-900">{item}</span>
              <button
                type="button"
                onClick={() => removeExpertise(item)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
        <div className="flex gap-2 mb-2">
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select interest...</option>
            {INTEREST_OPTIONS.filter(opt => !formData.interests.includes(opt)).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addInterest}
            disabled={!selectedInterest}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.interests.map((item) => (
            <div key={item} className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
              <span className="text-sm text-green-900">{item}</span>
              <button
                type="button"
                onClick={() => removeInterest(item)}
                className="text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
      >
        {loading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
      </button>
    </form>
  );
}
