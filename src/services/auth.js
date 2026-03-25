import axiosClient from '../utils/axios';

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password (min 6 characters)
 * @returns {Promise<Object>} Login response with user data
 *   - success: boolean
 *   - message: string
 *   - data: { user: { id, full_name, email, role, company_id, unit_id, created_at } }
 */
export const login = async (email, password) => {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Refresh access token using refresh token cookie
 * @returns {Promise<Object>} Refresh token response
 *   - success: boolean
 *   - message: string (e.g., "Access token refreshed")
 */
export const refreshToken = async () => {
  const response = await axiosClient.post('/auth/refresh-token');
  return response.data;
};

/**
 * Change password for current user
 * Requires valid access token
 * @param {string} currentPassword - Current password (min 6 characters)
 * @param {string} newPassword - New password (min 6 characters)
 * @returns {Promise<Object>} Change password response
 *   - success: boolean
 *   - message: string (e.g., "Password changed successfully")
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await axiosClient.patch('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/**
 * Get current user information
 * Requires valid access token
 * @returns {Promise<Object>} Current user response
 *   - success: boolean
 *   - message: string
 *   - data: { user: { id, full_name, email, role, avatar_url, company_id, unit_id, created_at, updated_at } }
 */
export const getCurrentUser = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};

/**
 * Logout and clear authentication tokens
 * Clears accessToken and refreshToken cookies
 * @returns {Promise<Object>} Logout response
 *   - success: boolean
 *   - message: string (e.g., "Logged out successfully")
 */
export const logout = async () => {
  const response = await axiosClient.post('/auth/logout');
  return response.data;
};
