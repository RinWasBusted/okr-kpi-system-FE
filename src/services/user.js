import axiosClient from '../utils/axios.js';

/**
 * Get list of employees
 * @description Returns a paginated list of employees in the company. Supports filtering by unit and search by name or email.
 * Requires `accessToken` cookie and `ADMIN_COMPANY` role.
 * 
 * @param {Object} params - Query parameters
 * @param {number} [params.unit_id] - Filter by unit ID (optional)
 * @param {string} [params.search] - Search by full name or email, supports partial match (optional, max 255 chars)
 * @param {number} [params.page=1] - Current page number (default: 1)
 * @param {number} [params.per_page=20] - Records per page (default: 20, max: 100)
 * 
 * @returns {Promise<Object>} API response with users list and pagination metadata
 * @returns {Promise<Object>} Response structure on success (HTTP 200):
 * {
 *   success: true,
 *   message: "Users retrieved successfully",
 *   data: [{
 *     id: number,
 *     full_name: string,
 *     email: string,
 *     job_title: string | null,
 *     avatar_url: string | null,
 *     role: "ADMIN_COMPANY" | "EMPLOYEE",
 *     unit: { id: number, name: string } | null,
 *     is_active: boolean,
 *     created_at: string (ISO 8601 format)
 *   }],
 *   meta: {
 *     total: number,
 *     page: number,
 *     per_page: number,
 *     last_page: number
 *   }
 * }
 * 
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 *   - error.code: "UNAUTHORIZED"
 *   - error.message: "Access token is missing"
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 *   - error.code: "FORBIDDEN"
 *   - error.message: "Access denied"
 */
export const getUsers = async (params = {}) => {
  const response = await axiosClient.get('/users', { params });
  return response.data;
};

/**
 * Get employee detail by ID
 * @description Returns detailed information of a specific employee. Requires `accessToken` cookie and `ADMIN_COMPANY` role.
 * 
 * @param {number} id - User ID
 * 
 * @returns {Promise<Object>} API response with user details
 * @returns {Promise<Object>} Response structure on success (HTTP 200):
 * {
 *   success: true,
 *   message: "User retrieved successfully",
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
 *       created_at: string (ISO 8601 format)
 *     }
 *   }
 * }
 * 
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 *   - error.code: "UNAUTHORIZED"
 *   - error.message: "Access token is missing"
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 *   - error.code: "FORBIDDEN"
 *   - error.message: "Access denied"
 * @throws {Error} 404 Not Found - User not found
 *   - error.code: "NOT_FOUND"
 *   - error.message: "User not found"
 */
export const getUserById = async (id) => {
  const response = await axiosClient.get(`/users/${id}`);
  return response.data;
};

/**
 * Create a new employee
 * @description Creates a new Employee account in the company. Email must be unique across the entire platform.
 * Requires `accessToken` cookie and `ADMIN_COMPANY` role.
 *
 * @param {FormData} data - User data with multipart/form-data format
 * @param {string} data.full_name - Employee full name (required, 1-255 chars)
 * @param {string} data.email - Employee email (required, must be unique, max 255 chars)
 * @param {string} data.password - Employee password (required, min 8 chars)
 * @param {number} [data.unit_id] - Unit ID to assign employee (optional, set null to leave unassigned)
 * @param {string} [data.job_title] - Employee job title/position (optional, max 255 chars)
 * @param {File} [data.avatar] - Optional avatar image file (jpg, png, gif)
 *
 * @returns {Promise<Object>} API response with created user
 * @returns {Promise<Object>} Response structure on success (HTTP 201):
 * {
 *   success: true,
 *   message: "User created successfully",
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
 *       created_at: string (ISO 8601 format)
 *     }
 *   }
 * }
 * 
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 *   - error.code: "UNAUTHORIZED"
 *   - error.message: "Access token is missing"
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 *   - error.code: "FORBIDDEN"
 *   - error.message: "Access denied"
 * @throws {Error} 404 Not Found - Unit not found
 *   - error.code: "UNIT_NOT_FOUND"
 *   - error.message: "Unit not found"
 * @throws {Error} 409 Conflict - Email already exists
 *   - error.code: "EMAIL_EXISTS"
 *   - error.message: "Email already exists"
 * @throws {Error} 422 Unprocessable Entity - Validation error
 *   - error.code: "VALIDATION_ERROR"
 *   - error.message: "Password must be at least 8 characters" (or other validation messages)
 */
export const createUser = async (data) => {
  const response = await axiosClient.post('/users', data);
  return response.data;
};

/**
 * Update employee information
 * @description Update employee profile, unit assignment, password, or active status. Requires `accessToken` cookie and `ADMIN_COMPANY` role.
 * To let employees change their own password, use `PATCH /auth/change-password` instead.
 * At least one field is required to update.
 * 
 * @param {number} id - User ID
 * @param {Object} data - Update data (at least one field required)
 * @param {string} [data.full_name] - New full name (optional, 1-255 chars)
 * @param {number} [data.unit_id] - Unit ID to transfer employee (optional, set null to remove from unit)
 * @param {string} [data.password] - New password (optional, min 8 chars). For employee self-service, use PATCH /auth/change-password instead
 * @param {boolean} [data.is_active] - Active status (optional, false = lock account)
 * 
 * @returns {Promise<Object>} API response with updated user
 * @returns {Promise<Object>} Response structure on success (HTTP 200):
 * {
 *   success: true,
 *   message: "User updated successfully",
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
 *       created_at: string (ISO 8601 format)
 *     }
 *   }
 * }
 * 
 * @throws {Error} 400 Bad Request - No fields provided to update
 *   - error.code: "BAD_REQUEST"
 *   - error.message: "No fields provided to update"
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 *   - error.code: "UNAUTHORIZED"
 *   - error.message: "Access token is missing"
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 *   - error.code: "FORBIDDEN"
 *   - error.message: "Access denied"
 * @throws {Error} 404 Not Found - User or unit not found
 *   - error.code: "NOT_FOUND"
 *   - error.message: "User not found" | "Unit not found"
 * @throws {Error} 422 Unprocessable Entity - Validation error
 *   - error.code: "VALIDATION_ERROR"
 *   - error.message: "Password must be at least 8 characters" (or other validation messages)
 */
export const updateUser = async (id, data) => {
  const response = await axiosClient.put(`/users/${id}`, data);
  return response.data;
};

/**
 * Update user avatar
 * @description Upload or update user avatar. Can only be done by the user themselves or ADMIN_COMPANY. 
 * If no file is sent, the avatar will be deleted. Requires `accessToken` cookie.
 * 
 * @param {number} id - User ID
 * @param {FormData} formData - Form data containing avatar file
 * @param {File} [formData.avatar] - Avatar image file (jpg, png, gif). Omit to delete avatar.
 * 
 * @returns {Promise<Object>} API response with updated user
 * @returns {Promise<Object>} Response structure on success (HTTP 200):
 * {
 *   success: true,
 *   message: "Avatar updated successfully",
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
 *       created_at: string (ISO 8601 format)
 *     }
 *   }
 * }
 * 
 * @throws {Error} 400 Bad Request - Invalid user ID
 *   - error.code: "BAD_REQUEST"
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 *   - error.code: "UNAUTHORIZED"
 *   - error.message: "Access token is missing"
 * @throws {Error} 403 Forbidden - Not owner or admin
 *   - error.code: "FORBIDDEN"
 *   - error.message: "Access denied"
 * @throws {Error} 404 Not Found - User not found
 *   - error.code: "NOT_FOUND"
 *   - error.message: "User not found"
 */
export const updateUserAvatar = async (id, formData) => {
  const response = await axiosClient.patch(`/users/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete user avatar
 * @description Delete user avatar. Can only be done by the user themselves or ADMIN_COMPANY. Requires `accessToken` cookie.
 * 
 * @param {number} id - User ID
 * 
 * @returns {Promise<Object>} API response confirming deletion
 * @returns {Promise<Object>} Response structure on success (HTTP 200):
 * {
 *   success: true,
 *   message: "Avatar deleted successfully"
 * }
 * 
 * @throws {Error} 400 Bad Request - Invalid user ID
 *   - error.code: "BAD_REQUEST"
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 *   - error.code: "UNAUTHORIZED"
 *   - error.message: "Access token is missing"
 * @throws {Error} 403 Forbidden - Not owner or admin
 *   - error.code: "FORBIDDEN"
 *   - error.message: "Access denied"
 * @throws {Error} 404 Not Found - User not found
 *   - error.code: "NOT_FOUND"
 *   - error.message: "User not found"
 */
export const deleteUserAvatar = async (id) => {
  const response = await axiosClient.delete(`/users/${id}/avatar`);
  return response.data;
};

/**
 * Delete user
 * @description Delete a user account. Requires ADMIN_COMPANY role. Cannot delete the last ADMIN_COMPANY of a company.
 *
 * @param {number} id - User ID to delete
 *
 * @returns {Promise<Object>} API response confirming deletion
 * @returns {Promise<Object>} Response structure on success (HTTP 200):
 * {
 *   success: true,
 *   message: "User deleted successfully"
 * }
 *
 * @throws {Error} 400 Bad Request - Cannot delete last admin
 *   - error.code: "BAD_REQUEST"
 *   - error.message: "Cannot delete the last company admin"
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 *   - error.code: "UNAUTHORIZED"
 * @throws {Error} 403 Forbidden - Access denied
 *   - error.code: "FORBIDDEN"
 * @throws {Error} 404 Not Found - User not found
 *   - error.code: "NOT_FOUND"
 */
export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
};
