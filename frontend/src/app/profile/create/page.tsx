'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';
import { apiClient } from '@/lib/api';

export default function CreateProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.getProfile();
        // Check if the response has data and was successful
        if (response.status === 200 && response.data) {
          setProfileData(response.data);
        } else {
          // Profile doesn't exist yet, that's fine
          setProfileData(null);
        }
      } catch (error) {
        // Profile doesn't exist yet, that's fine
        console.log('No existing profile');
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSuccess = () => {
    router.push('/mentors');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <ProfileForm 
        initialData={profileData} 
        onSuccess={handleSuccess}
        isEditing={!!profileData}
      />
    </div>
  );
}
