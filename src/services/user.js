import axiosClient from '../utils/axios.js';

/**
 * Get list of employees
 * @async
 * @function getUsers
 * @description Returns a paginated list of employees in the company. Supports filtering by unit and search by name or email.
 * Requires accessToken cookie and ADMIN_COMPANY role.
 * 
 * @param {Object} [params={}] - Query parameters (optional)
 * @param {number} [params.unit_id] - Filter by unit ID (optional)
 * @param {string} [params.search] - Search by full name or email, supports partial match (optional, max 255 chars)
 * @param {number} [params.page=1] - Current page number (default: 1)
 * @param {number} [params.per_page=20] - Records per page (default: 20, max: 100)
 * 
 * @returns {Promise<Object>} Response object (HTTP 200 OK)
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of user objects
 * @returns {number} response.data[].id - User ID
 * @returns {string} response.data[].full_name - Employee full name
 * @returns {string} response.data[].email - Employee email
 * @returns {string} [response.data[].job_title] - Job title (nullable)
 * @returns {string} [response.data[].avatar_url] - Avatar URL (nullable)
 * @returns {string} response.data[].role - User role (ADMIN_COMPANY | EMPLOYEE)
 * @returns {Object} [response.data[].unit] - Unit object (nullable)
 * @returns {number} response.data[].unit.id - Unit ID
 * @returns {string} response.data[].unit.name - Unit name
 * @returns {boolean} response.data[].is_active - Active status
 * @returns {string} response.data[].created_at - Creation timestamp (ISO 8601)
 * @returns {Object} response.meta - Pagination metadata
 * @returns {number} response.meta.total - Total records count
 * @returns {number} response.meta.page - Current page
 * @returns {number} response.meta.per_page - Records per page
 * @returns {number} response.meta.last_page - Last page number
 * 
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 * 
 * @example
 * const employees = await getUsers({ per_page: 100 });
 * const filtered = await getUsers({ unit_id: 5, search: 'Nguyen' });
 */
export const getUsers = async (params = {}) => {
  const response = await axiosClient.get('/users', { params });
  return response.data;
};

/**
 * Get employee detail by ID
 * @async
 * @function getUserById
 * @description Returns detailed information of a specific employee. Requires accessToken cookie and ADMIN_COMPANY role.
 * 
 * @param {number} id - User ID (required)
 * 
 * @returns {Promise<Object>} Response object (HTTP 200 OK)
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Response data object
 * @returns {Object} response.data.user - User object
 * @returns {number} response.data.user.id - User ID
 * @returns {string} response.data.user.full_name - Employee full name
 * @returns {string} response.data.user.email - Employee email
 * @returns {string} [response.data.user.job_title] - Job title (nullable)
 * @returns {string} [response.data.user.avatar_url] - Avatar URL (nullable)
 * @returns {string} response.data.user.role - User role (ADMIN_COMPANY | EMPLOYEE)
 * @returns {Object} [response.data.user.unit] - Unit object (nullable)
 * @returns {number} response.data.user.unit.id - Unit ID
 * @returns {string} response.data.user.unit.name - Unit name
 * @returns {boolean} response.data.user.is_active - Active status
 * @returns {string} response.data.user.created_at - Creation timestamp (ISO 8601)
 * 
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 * @throws {Error} 404 Not Found - User not found
 * 
 * @example
 * const user = await getUserById(10);
 */
export const getUserById = async (id) => {
  const response = await axiosClient.get(`/users/${id}`);
  return response.data;
};

/**
 * Create a new employee
 * @async
 * @function createUser
 * @description Creates a new Employee account in the company. Email must be unique across the entire platform.
 * Requires accessToken cookie and ADMIN_COMPANY role.
 *
 * @param {FormData} data - User data with multipart/form-data format
 * @param {string} data.full_name - Employee full name (required, 1-255 chars)
 * @param {string} data.email - Employee email (required, unique, max 255 chars)
 * @param {string} data.password - Employee password (required, min 8 chars, max 255 chars)
 * @param {number} [data.unit_id] - Unit ID to assign employee (optional, null to leave unassigned)
 * @param {File} [data.avatar] - Optional avatar image file (jpg, png, gif)
 *
 * @returns {Promise<Object>} Response object (HTTP 201 Created)
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Response data object
 * @returns {Object} response.data.user - Created user object
 * @returns {number} response.data.user.id - User ID
 * @returns {string} response.data.user.full_name - Employee full name
 * @returns {string} response.data.user.email - Employee email
 * @returns {string} [response.data.user.job_title] - Job title (nullable, default null)
 * @returns {string} [response.data.user.avatar_url] - Avatar URL (nullable, e.g., "okr-kpi-system/users/avatars/image-123")
 * @returns {string} response.data.user.role - User role (EMPLOYEE for newly created users)
 * @returns {Object} [response.data.user.unit] - Unit object (nullable)
 * @returns {number} response.data.user.unit.id - Unit ID
 * @returns {string} response.data.user.unit.name - Unit name
 * @returns {boolean} response.data.user.is_active - Active status (default: true)
 * @returns {string} response.data.user.created_at - Creation timestamp (ISO 8601)
 * 
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 * @throws {Error} 404 Not Found - Unit not found
 * @throws {Error} 409 Conflict - Email already exists
 * @throws {Error} 422 Unprocessable Entity - Validation error (e.g., password min 8 chars)
 * 
 * @example
 * const formData = new FormData();
 * formData.append('full_name', 'Nguyen Van A');
 * formData.append('email', 'nguyenvana@acme.com');
 * formData.append('password', 'password123');
 * formData.append('unit_id', 2);
 * const newUser = await createUser(formData);
 */
export const createUser = async (data) => {
  const response = await axiosClient.post('/users', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update employee information
 * @async
 * @function updateUser
 * @description Update employee profile, unit assignment, job title, password, or active status.
 * Requires `accessToken` cookie and `ADMIN_COMPANY` role.
 * For employees changing their own password, use `PATCH /auth/change-password` instead.
 * At least one field is required to update.
 * 
 * @param {number} id - User ID (required)
 * @param {Object} data - Update data (at least one field required)
 * @param {string} [data.full_name] - New full name (optional, 1-255 chars)
 * @param {string} [data.job_title] - New job title (optional, 1-100 chars, set null to remove)
 * @param {number} [data.unit_id] - Unit ID to transfer employee (optional, set null to remove from unit)
 * @param {string} [data.password] - New password (optional, min 8 chars, max 255 chars). Admin reset on behalf of employee.
 * @param {boolean} [data.is_active] - Active status (optional, false = lock the employee account)
 * 
 * @returns {Promise<Object>} Response object (HTTP 200 OK)
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Response data object
 * @returns {Object} response.data.user - Updated user object
 * @returns {number} response.data.user.id - User ID
 * @returns {string} response.data.user.full_name - Employee full name
 * @returns {string} response.data.user.email - Employee email
 * @returns {string} [response.data.user.job_title] - Job title (nullable)
 * @returns {string} [response.data.user.avatar_url] - Avatar URL (nullable)
 * @returns {string} response.data.user.role - User role (ADMIN_COMPANY | EMPLOYEE)
 * @returns {Object} [response.data.user.unit] - Unit object (nullable)
 * @returns {number} response.data.user.unit.id - Unit ID
 * @returns {string} response.data.user.unit.name - Unit name
 * @returns {boolean} response.data.user.is_active - Active status
 * @returns {string} response.data.user.created_at - Creation timestamp (ISO 8601)
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
 * 
 * @example
 * // Update full name
 * await updateUser(10, { full_name: 'Nguyen Van B' });
 * 
 * @example
 * // Update multiple fields
 * await updateUser(10, { 
 *   full_name: 'Nguyen Van B',
 *   job_title: 'Senior Engineer',
 *   unit_id: 3,
 *   is_active: false
 * });
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
 * Delete user (soft delete)
 * @async
 * @function deleteUser
 * @description Soft delete (deactivate) a user by marking with deleted_at timestamp.
 * Requires accessToken cookie and ADMIN_COMPANY role.
 * Cannot delete the last ADMIN_COMPANY of a company.
 *
 * @param {number} id - User ID to delete (required)
 *
 * @returns {Promise<void>} No content response (HTTP 204 No Content)
 *
 * @throws {Error} 400 Bad Request - Cannot delete last admin or user already deleted
 * @throws {Error} 401 Unauthorized - Access token missing or invalid
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role)
 * @throws {Error} 404 Not Found - User not found
 * 
 * @example
 * await deleteUser(10);
 */
export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
};
