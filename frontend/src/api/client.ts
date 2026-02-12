// Stub API client for demo mode - no backend communication
export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    // Demo mode - no real token storage
  }

  clearAuthToken() {
    // Demo mode - no auth needed
  }

  async register(data: any): Promise<any> {
    throw new Error('Registration not available in demo mode');
  }

  async login(credentials: any): Promise<any> {
    throw new Error('Login not available in demo mode');
  }

  async getCurrentUser(): Promise<any> {
    throw new Error('API calls not available in demo mode');
  }

  async updateProfile(id: string, data: any): Promise<any> {
    throw new Error('Profile updates not available in demo mode');
  }

  async getProfiles(params?: any): Promise<any> {
    throw new Error('API calls not available in demo mode');
  }

  async createProfile(data: any): Promise<any> {
    throw new Error('Profile creation not available in demo mode');
  }

  async sendMessage(data: any): Promise<any> {
    throw new Error('Messaging not available in demo mode');
  }

  async getMessages(params?: any): Promise<any> {
    throw new Error('Messaging not available in demo mode');
  }

  async rateUser(data: any): Promise<any> {
    throw new Error('Rating not available in demo mode');
  }
}

export const apiClient = new APIClient();
