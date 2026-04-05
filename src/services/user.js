import axiosClient from '../utils/axios.js';

/**
 * Get list of employees
 * @param {Object} params - Query parameters
 * @param {number} params.unit_id - Filter by unit ID (optional)
 * @param {string} params.search - Search by full name or email, supports partial match (optional, max 255 chars)
 * @param {number} params.page - Current page number (default: 1)
 * @param {number} params.per_page - Records per page (default: 20, max: 100)
 * @returns {Promise<Object>} API response with users list and pagination metadata
 * @returns {Promise<Object>} Response structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data: [{
 *     id: number,
 *     full_name: string,
 *     email: string,
 *     job_title: string | null,
 *     avatar_url: string | null,
 *     role: "ADMIN_COMPANY" | "EMPLOYEE",
 *     unit: { id: number, name: string } | null,
 *     is_active: boolean,
 *     created_at: string (ISO 8601)
 *   }],
 *   meta: {
 *     total: number,
 *     page: number,
 *     per_page: number,
 *     last_page: number
 *   }
 * }
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 */
export const getUsers = async (params = {}) => {
  const response = await axiosClient.get('/users', { params });
  return response.data;
};

/**
 * Get employee detail by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} API response with user details
 * @returns {Promise<Object>} Response structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     user: {
 *       id: number,
 *       full_name: string,
 *       email: string,
 *       job_title: string | null,
 *       avatar_url: string | null,
 *       role: "ADMIN_COMPANY" | "EMPLOYEE",
 *       unit: { id: number, name: string } | null,
 *       is_active: boolean,
 *       created_at: string (ISO 8601)
 *     }
 *   }
 * }
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 * @throws {Error} 404 Not Found - User not found
 */
export const getUserById = async (id) => {
  const response = await axiosClient.get(`/users/${id}`);
  return response.data;
};

/**
 * Create a new employee
 * @param {FormData} data - User data with multipart/form-data format
 * @param {string} data.full_name - Employee full name (required, 1-255 chars)
 * @param {string} data.email - Employee email (required, must be unique, max 255 chars)
 * @param {string} data.password - Employee password (required, min 8 chars)
 * @param {number} data.unit_id - Unit ID to assign employee (optional, set null to leave unassigned)
 * @param {File} data.avatar - Optional avatar image file (jpg, png, gif)
 * @returns {Promise<Object>} API response with created user
 * @returns {Promise<Object>} Response structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     user: {
 *       id: number,
 *       full_name: string,
 *       email: string,
 *       job_title: string | null,
 *       avatar_url: string | null (e.g., "okr-kpi-system/users/avatars/image-123"),
 *       role: "EMPLOYEE",
 *       unit: { id: number, name: string } | null,
 *       is_active: boolean,
 *       created_at: string (ISO 8601)
 *     }
 *   }
 * }
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 * @throws {Error} 404 Not Found - Unit not found
 * @throws {Error} 409 Conflict - Email already exists
 * @throws {Error} 422 Unprocessable Entity - Validation error (e.g., password too short)
 */
export const createUser = async (data) => {
  const response = await axiosClient.post('/users', data);
  return response.data;
};

/**
 * Update employee information
 * @param {number} id - User ID
 * @param {Object} data - Update data (at least one field required)
 * @param {string} data.full_name - New full name (optional, 1-255 chars)
 * @param {number} data.unit_id - Unit ID to transfer employee (optional, set null to remove from unit)
 * @param {string} data.password - New password (optional, min 8 chars). For employee self-service, use PATCH /auth/change-password instead
 * @param {boolean} data.is_active - Active status (optional, false = lock account)
 * @returns {Promise<Object>} API response with updated user
 * @returns {Promise<Object>} Response structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     user: {
 *       id: number,
 *       full_name: string,
 *       email: string,
 *       job_title: string | null,
 *       avatar_url: string | null,
 *       role: "ADMIN_COMPANY" | "EMPLOYEE",
 *       unit: { id: number, name: string } | null,
 *       is_active: boolean,
 *       created_at: string (ISO 8601)
 *     }
 *   }
 * }
 * @throws {Error} 400 Bad Request - No fields provided to update
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 * @throws {Error} 404 Not Found - User or unit not found
 * @throws {Error} 422 Unprocessable Entity - Validation error (e.g., password too short)
 */
export const updateUser = async (id, data) => {
  const response = await axiosClient.put(`/users/${id}`, data);
  return response.data;
};

/**
 * Update user avatar
 * @param {number} id - User ID
 * @param {FormData} formData - Form data containing avatar file
 * @param {File} formData.avatar - Avatar image file (jpg, png, gif). Omit to delete avatar.
 * @returns {Promise<Object>} API response with updated user
 * @returns {Promise<Object>} Response structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     user: {
 *       id: number,
 *       full_name: string,
 *       email: string,
 *       job_title: string | null,
 *       avatar_url: string | null,
 *       role: "ADMIN_COMPANY" | "EMPLOYEE",
 *       unit: { id: number, name: string } | null,
 *       is_active: boolean,
 *       created_at: string (ISO 8601)
 *     }
 *   }
 * }
 * @description Can only be done by the user themselves or ADMIN_COMPANY. If no file is sent, the avatar will be deleted.
 * @throws {Error} 400 Bad Request - Invalid user ID
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Not owner or admin
 * @throws {Error} 404 Not Found - User not found
 */
export const updateUserAvatar = async (id, formData) => {
  const response = await axiosClient.patch(`/users/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete user avatar
 * @param {number} id - User ID
 * @returns {Promise<Object>} API response confirming deletion
 * @returns {Promise<Object>} Response structure:
 * {
 *   success: boolean,
 *   message: string
 * }
 * @description Can only be done by the user themselves or ADMIN_COMPANY.
 * @throws {Error} 400 Bad Request - Invalid user ID
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Not owner or admin
 * @throws {Error} 404 Not Found - User not found
 */
export const deleteUserAvatar = async (id) => {
  const response = await axiosClient.delete(`/users/${id}/avatar`);
  return response.data;
};
