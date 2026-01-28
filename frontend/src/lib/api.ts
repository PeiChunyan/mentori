// frontend/src/lib/api.ts
// API client for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationLoginRequest {
  email: string;
  code: string;
  role?: 'mentor' | 'mentee';
}

export interface OAuthLoginRequest {
  provider: 'google' | 'apple';
  id_token: string;
  role?: 'mentor' | 'mentee';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  };
  token: string;
}

export interface NewUserResponse {
  is_new_user: boolean;
  email: string;
  provider: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; status: number; error?: ErrorResponse }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        status: response.status,
        error: !response.ok ? data : undefined,
      };
    } catch (error) {
      return {
        status: 0,
        error: {
          error: 'Network Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Email Verification
  async sendVerificationCode(email: string) {
    return this.request('/auth/email/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyCode(email: string, code: string, role?: 'mentor' | 'mentee') {
    const body: EmailVerificationLoginRequest = { email, code };
    if (role) body.role = role;

    return this.request<AuthResponse | NewUserResponse>('/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // OAuth
  async oauthLogin(provider: 'google' | 'apple', idToken: string, role?: 'mentor' | 'mentee') {
    const body: OAuthLoginRequest = { provider, id_token: idToken };
    if (role) body.role = role;

    return this.request<AuthResponse | NewUserResponse>('/auth/oauth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Profile Management
  async createProfile(data: any) {
    return this.request<any>('/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mentori_auth') : ''}`,
      },
    });
  }

  async getProfile() {
    return this.request<any>('/profiles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mentori_auth') : ''}`,
      },
    });
  }

  async updateProfile(data: any) {
    return this.request<any>('/profiles', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mentori_auth') : ''}`,
      },
    });
  }

  async deleteProfile() {
    return this.request<any>('/profiles', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mentori_auth') : ''}`,
      },
    });
  }

  // Mentor Discovery
  async searchProfiles(filters: any = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.location) queryParams.append('location', filters.location);
    
    if (filters.expertise && Array.isArray(filters.expertise)) {
      filters.expertise.forEach((e: string) => queryParams.append('expertise', e));
    }
    if (filters.interests && Array.isArray(filters.interests)) {
      filters.interests.forEach((i: string) => queryParams.append('interests', i));
    }
    
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());

    return this.request<any[]>(`/profiles/public?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mentori_auth') : ''}`,
      },
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);