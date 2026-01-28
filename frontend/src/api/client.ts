import { AuthApi, ProfilesApi, Configuration, ModelsRegisterRequestRoleEnum } from './api';

// 🚀 OPTIMIZATION: Request deduplication and caching
const pendingRequests = new Map<string, Promise<any>>();
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// 🚀 OPTIMIZATION: Enhanced error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 🚀 OPTIMIZATION: Custom API client with optimizations
class OptimizedApiClient {
  private authApi: AuthApi;
  private profilesApi: ProfilesApi;
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') {
    this.baseURL = baseURL;

    const config = new Configuration({
      basePath: baseURL,
      // 🚀 OPTIMIZATION: Add request/response interceptors
      middleware: [{
        pre: async (context: any) => {
          // Add auth token to requests
          const token = this.getToken();
          if (token) {
            context.init.headers = {
              ...context.init.headers,
              'Authorization': `Bearer ${token}`,
            };
          }
          return context;
        },
        post: async (context: any) => {
          // Handle common errors
          if (context.response && !context.response.ok) {
            const errorData = await context.response.json().catch(() => ({}));
            throw new ApiError(
              errorData.message || 'API request failed',
              context.response.status,
              errorData.error
            );
          }
          return context;
        }
      }]
    });

    this.authApi = new AuthApi(config);
    this.profilesApi = new ProfilesApi(config);
  }

  // 🚀 OPTIMIZATION: Cached request wrapper
  private async cachedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    useCache: boolean = true
  ): Promise<T> {
    // Check cache first
    if (useCache) {
      const cached = responseCache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    // Check for pending request (deduplication)
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)!;
    }

    // Make new request
    const request = requestFn()
      .then(data => {
        // Cache successful responses
        if (useCache) {
          responseCache.set(key, { data, timestamp: Date.now() });
        }
        return data;
      })
      .catch(error => {
        // Clean up pending request on error
        pendingRequests.delete(key);
        throw error;
      });

    pendingRequests.set(key, request);
    return request;
  }

  // 🚀 OPTIMIZATION: Auth methods with error handling
  async login(email: string, password: string) {
    try {
      const response = await this.authApi.authLoginPost({
        email,
        password
      });

      // Store token
      if (response.data?.token) {
        this.setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Login failed', 500);
    }
  }

  async register(email: string, password: string, role: string) {
    try {
      const response = await this.authApi.authRegisterPost({
        email,
        password,
        role: role as ModelsRegisterRequestRoleEnum
      });

      // Store token
      if (response.data?.token) {
        this.setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Registration failed', 500);
    }
  }

  async logout() {
    try {
      await this.authApi.authLogoutPost();
      this.clearToken();
    } catch (error) {
      // Even if logout fails, clear local token
      this.clearToken();
      throw new ApiError('Logout failed', 500);
    }
  }

  // 🚀 OPTIMIZATION: Profile methods with caching
  async getProfile() {
    return this.cachedRequest(
      'profile',
      () => this.profilesApi.profilesGet(this.getAuthHeader()),
      false // Don't cache profile data for security
    );
  }

  async updateProfile(profileData: any) {
    try {
      const response = await this.profilesApi.profilesPut(
        this.getAuthHeader(),
        profileData
      );

      // Clear profile cache after update
      responseCache.delete('profile');

      return response.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Profile update failed', 500);
    }
  }

  async getPublicProfiles(filters?: {
    expertise?: string[];
    interests?: string[];
    location?: string;
    role?: string;
  }) {
    const cacheKey = `public-profiles-${JSON.stringify(filters)}`;

    return this.cachedRequest(
      cacheKey,
      () => this.profilesApi.profilesPublicGet(
        filters?.expertise,
        filters?.interests,
        filters?.location,
        filters?.role
      )
    );
  }

  // 🚀 OPTIMIZATION: Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
  }

  private getAuthHeader(): string {
    const token = this.getToken();
    return token ? `Bearer ${token}` : '';
  }

  // 🚀 OPTIMIZATION: Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.json();
    } catch (error) {
      throw new ApiError('Health check failed', 500);
    }
  }
}

// 🚀 OPTIMIZATION: Export singleton instance
export const apiClient = new OptimizedApiClient();

// 🚀 OPTIMIZATION: Export types for better TypeScript support
export type { ModelsAuthResponse, ModelsProfile, ModelsUserResponse } from './api';