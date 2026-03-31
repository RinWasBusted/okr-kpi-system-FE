import axiosClient from '../utils/axios.js';

/**
 * Get list of employees
 * @param {Object} params - Query parameters
 * @param {number} params.unit_id - Filter by unit ID (optional)
 * @param {string} params.search - Search by full name or email (optional)
 * @param {number} params.page - Current page number (default: 1)
 * @param {number} params.per_page - Records per page (default: 20, max: 100)
 * @returns {Promise} API response with users list and pagination metadata
 */
export const getUsers = async (params = {}) => {
  const response = await axiosClient.get('/users', { params });
  return response.data;
};

/**
 * Get employee detail by ID
 * @param {number} id - User ID
 * @returns {Promise} API response with user details
 */
export const getUserById = async (id) => {
  const response = await axiosClient.get(`/users/${id}`);
  return response.data;
};

/**
 * Create a new employee
 * @param {Object} data - User data
 * @param {string} data.full_name - Employee full name (required)
 * @param {string} data.email - Employee email (required, must be unique)
 * @param {string} data.password - Employee password (required, min 8 characters)
 * @param {number} data.unit_id - Unit ID to assign employee (optional)
 * @returns {Promise} API response with created user
 */
export const createUser = async (data) => {
  const response = await axiosClient.post('/users', data);
  return response.data;
};

/**
 * Update employee information
 * @param {number} id - User ID
 * @param {Object} data - Update data
 * @param {string} data.full_name - New full name (optional)
 * @param {number} data.unit_id - Unit ID to transfer employee (optional, set null to remove)
 * @param {string} data.password - New password (optional, min 8 characters)
 * @param {boolean} data.is_active - Active status (optional, false = lock account)
 * @returns {Promise} API response with updated user
 */
export const updateUser = async (id, data) => {
  const response = await axiosClient.put(`/users/${id}`, data);
  return response.data;
};

/**
 * Delete employee (soft delete)
 * @param {number} id - User ID
 * @returns {Promise} API response
 */
export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
};
