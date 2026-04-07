import axiosClient from '../utils/axios';

/**
 * Login with email and password
 * @async
 * @function login
 * @param {string} email - User email (required)
 * @param {string} password - User password (required, min 6 characters)
 * @param {string} [company_slug] - Company slug for multi-tenant applications (optional)
 *   If provided, the system will attempt to find the user within the specified company
 * @param {boolean} [remember_me=false] - If true, refresh token expires in 30 days instead of 7 days (optional)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether login was successful
 * @returns {string} response.message - Response message (e.g., "Login successful")
 * @returns {Object} response.data - Login data wrapper
 * @returns {Object} response.data.user - Authenticated user information
 * @returns {number} response.data.user.id - User ID
 * @returns {string} response.data.user.full_name - User full name
 * @returns {string} response.data.user.email - User email address
 * @returns {string} response.data.user.role - User role (admin, manager, employee)
 * @returns {string} [response.data.user.avatar_url] - Avatar URL (nullable)
 * @returns {number} response.data.user.company_id - Company ID
 * @returns {string} response.data.user.company_slug - Company slug
 * @returns {number} [response.data.user.unit_id] - Unit ID (nullable)
 * @returns {string} [response.data.user.unit_name] - Unit name (nullable)
 * @returns {number} response.data.user.expires_in - Access token TTL in seconds
 * @returns {string} response.headers['Set-Cookie'] - Sets accessToken and refreshToken cookies
 * 
 * @throws {Error} If login fails:
 *   - 400: Invalid input (e.g., invalid email format)
 *   - 401: Invalid credentials (email or password incorrect)
 *   - 403: Account deactivated - "Your account has been deactivated. Contact your administrator."
 *   - 404: Company not found (if company_slug provided but doesn't exist)
 *   - 429: Too many attempts - rate limited with Retry-After header
 * 
 * @description Login with email and password. Returns accessToken and refreshToken cookies.
 * Supports device tracking and remember me functionality.
 * The system will set secure HTTP-only cookies for token management.
 * 
 * @example
 * const result = await login('user@example.com', 'password123');
 * const resultWithCompany = await login('user@example.com', 'password123', 'acme-corp', true);
 */
export const login = async (email, password, company_slug = null, remember_me = false) => {
  const payload = { email, password };
  if (company_slug) {
    payload.company_slug = company_slug;
  }
  if (remember_me) {
    payload.remember_me = remember_me;
  }
  const response = await axiosClient.post('/auth/login', payload);
  return response.data;
};

/**
 * Refresh access token using refresh token cookie
 * @async
 * @function refreshToken
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether token refresh was successful
 * @returns {string} response.message - Response message (e.g., "Access token refreshed")
 * @returns {Object} response.data - Token data wrapper
 * @returns {number} response.data.expires_in - New access token TTL in seconds
 * @returns {string} response.headers['Set-Cookie'] - Sets new accessToken and refreshToken cookies (token rotation)
 * 
 * @throws {Error} If refresh fails:
 *   - 401: Refresh token not found or expired - "Refresh token not found"
 *   - 403: Session revoked - "Session has been revoked. Please login again."
 * 
 * @description Refresh access token using refreshToken cookie. Returns new accessToken cookie.
 * Implements token rotation - the old refresh token is invalidated and a new one is issued.
 * 
 * @example
 * const result = await refreshToken();
 */
export const refreshToken = async () => {
  const response = await axiosClient.post('/auth/refresh-token');
  return response.data;
};

/**
 * Change password for current user
 * @async
 * @function changePassword
 * @param {string} currentPassword - Current password (required, min 6 characters)
 * @param {string} newPassword - New password (required, min 8 characters, must contain uppercase and number)
 * @param {string} [confirmPassword] - Optional confirmation password for validation
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether password change was successful
 * @returns {string} response.message - Response message (e.g., "Password changed successfully")
 * @returns {Object} response.data - Change password result data
 * @returns {number} response.data.sessions_revoked - Number of other sessions that were logged out
 * 
 * @throws {Error} If change fails:
 *   - 400: Invalid input or validation error
 *     - "Invalid input"
 *     - "Current password is incorrect"
 *     - "New password must be different from current password"
 *   - 401: Access token missing or invalid - "Access token is missing"
 * 
 * @description Change password for current user. Requires accessToken cookie.
 * Invalidates all other sessions upon success.
 * New password must be at least 8 characters and contain uppercase letter and number.
 * 
 * @example
 * const result = await changePassword('oldpassword123', 'Newpassword123');
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword = null) => {
  const payload = {
    currentPassword,
    newPassword,
  };
  if (confirmPassword) {
    payload.confirmPassword = confirmPassword;
  }
  const response = await axiosClient.patch('/auth/change-password', payload);
  return response.data;
};

/**
 * Get current user information
 * @async
 * @function getCurrentUser
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "Current user retrieved successfully")
 * @returns {Object} response.data - Current user data wrapper
 * @returns {Object} response.data.user - Current user information
 * @returns {number} response.data.user.id - User ID
 * @returns {string} response.data.user.full_name - User full name
 * @returns {string} response.data.user.email - User email address (format: email)
 * @returns {string} response.data.user.role - User role (admin, manager, employee)
 * @returns {string} [response.data.user.avatar_url] - Avatar URL, Cloudinary 50x50 pixels (nullable)
 * @returns {number} response.data.user.company_id - Company ID
 * @returns {string} [response.data.user.company_slug] - Company slug (nullable)
 * @returns {string} [response.data.user.company_name] - Company name (nullable)
 * @returns {number} [response.data.user.unit_id] - Unit ID (nullable)
 * @returns {string} [response.data.user.unit_name] - Unit name (nullable)
 * @returns {boolean} response.data.user.is_active - Whether user account is active
 * @returns {string} response.data.user.created_at - Creation date in ISO 8601 format (cannot be changed)
 * 
 * @throws {Error} If request fails:
 *   - 401: Access token missing/invalid or account no longer exists
 *     - "Access token is missing"
 *     - "Account no longer exists. Please login again."
 * 
 * @description Retrieve information of the currently authenticated user. Requires accessToken cookie.
 * 
 * @example
 * const result = await getCurrentUser();
 * const user = result.data.user;
 */
export const getCurrentUser = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};

/**
 * Logout and clear authentication tokens
 * @async
 * @function logout
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether logout was successful
 * @returns {string} response.message - Response message (e.g., "Logged out successfully")
 * @returns {string} response.headers['Set-Cookie'] - Clears accessToken and refreshToken cookies
 * 
 * @throws {Error} If logout fails:
 *   - 401: Already logged out or invalid token - "Already logged out"
 * 
 * @description Logout and clear authentication tokens. Clears accessToken and refreshToken cookies.
 * The refresh token is blacklisted on the server side to prevent reuse.
 * 
 * @example
 * const result = await logout();
 */
export const logout = async () => {
  const response = await axiosClient.post('/auth/logout');
  return response.data;
};

/**
 * Logout from all devices
 * @async
 * @function logoutAll
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether logout was successful
 * @returns {string} response.message - Response message (e.g., "Logged out from all devices successfully")
 * @returns {Object} response.data - Logout result data
 * @returns {number} response.data.sessions_revoked - Number of sessions revoked across all devices
 * 
 * @throws {Error} If logout fails:
 *   - 401: Access token missing or invalid - "Access token is missing"
 * 
 * @description Revoke all refresh tokens for the current user across all devices. Requires accessToken cookie.
 * This will log the user out from all devices/browsers immediately.
 * 
 * @example
 * const result = await logoutAll();
 */
export const logoutAll = async () => {
  const response = await axiosClient.post('/auth/logout-all');
  return response.data;
};

/**
 * Get active sessions for current user
 * @async
 * @function getSessions
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "Sessions retrieved successfully")
 * @returns {Array<Object>} response.data - Array of active sessions
 * @returns {string} response.data[].id - Opaque session identifier (UUID)
 * @returns {Object} response.data[].device_info - Device information
 * @returns {string} response.data[].device_info.name - Device name (e.g., "Chrome/Windows")
 * @returns {string} response.data[].device_info.fingerprint - Device fingerprint
 * @returns {string} response.data[].created_at - Session creation date in ISO 8601 format
 * @returns {boolean} response.data[].current - Whether this is the current session
 * 
 * @throws {Error} If request fails:
 *   - 401: Access token missing or invalid - "Access token is missing"
 * 
 * @description Retrieve list of active sessions for the current user. Requires accessToken cookie.
 * Each session has an opaque UUID identifier for management.
 * 
 * @example
 * const result = await getSessions();
 * const sessions = result.data; // Array of session objects
 */
export const getSessions = async () => {
  const response = await axiosClient.get('/auth/sessions');
  return response.data;
};

/**
 * Revoke a specific session
 * @async
 * @function deleteSession
 * @param {string} sessionId - The opaque session ID (UUID) returned by getSessions (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether session revocation was successful
 * @returns {string} response.message - Response message (e.g., "Session revoked successfully")
 * 
 * @throws {Error} If revocation fails:
 *   - 401: Access token missing or invalid - "Access token is missing"
 *   - 404: Session not found - "Session not found"
 * 
 * @description Revoke a specific session by session ID. Requires accessToken cookie.
 * Use getSessions() to retrieve the list of available session IDs.
 * 
 * @example
 * const result = await deleteSession('550e8400-e29b-41d4-a716-446655440000');
 */
export const deleteSession = async (sessionId) => {
  const response = await axiosClient.delete(`/auth/sessions/${sessionId}`);
  return response.data;
};
