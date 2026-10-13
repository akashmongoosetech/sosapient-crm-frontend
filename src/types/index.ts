export interface User {
  id: string; firstName: string; lastName: string; email: string;
  mobileNumber: string; username: string; profilePicUrl: string;
  role: 'admin' | 'manager'; isActive: boolean;
  emailVerified: boolean; mobileVerified: boolean;
  lastLoginAt: string | null; createdAt: string; updatedAt: string;
}
export interface ApiEnvelope<T> { success: boolean; message: string; data: T; errors?: { field: string; message: string }[] }
