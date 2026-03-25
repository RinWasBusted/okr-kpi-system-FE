import axiosClient from '../utils/axios';

/**
 * Get list of company admins with pagination and filters
 * @param {number} companyId - Company ID
 * @param {Object} params - Query parameters
 * @param {boolean} params.is_active - Filter by active status
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Records per page (default: 20)
 * @returns {Promise<Object>} List of company admins with pagination metadata
 */
export const getCompanyAdmins = async (companyId, params = {}) => {
  const response = await axiosClient.get(`/admin/companies/${companyId}/admins`, { params });
  return response.data;
};

/**
 * Create new company admin
 * @param {number} companyId - Company ID
 * @param {Object} data - Admin data
 * @param {string} data.full_name - Full name (required)
 * @param {string} data.email - Email address (required)
 * @param {string} data.password - Password, min 8 characters (required)
 * @returns {Promise<Object>} Created admin details
 */
export const createCompanyAdmin = async (companyId, data) => {
  const response = await axiosClient.post(`/admin/companies/${companyId}/admins`, data);
  return response.data;
};

/**
 * Update company admin
 * @param {number} companyId - Company ID
 * @param {number} adminId - Admin ID
 * @param {Object} data - Admin data to update
 * @param {string} data.full_name - Full name
 * @param {string} data.email - Email address
 * @param {string} data.password - Password (min 8 characters)
 * @param {boolean} data.is_active - Active status
 * @returns {Promise<Object>} Updated admin details
 */
export const updateCompanyAdmin = async (companyId, adminId, data) => {
  const response = await axiosClient.put(
    `/admin/companies/${companyId}/admins/${adminId}`,
    data
  );
  return response.data;
};

/**
 * Deactivate company admin (soft delete)
 * Sets is_active = false
 * @param {number} companyId - Company ID
 * @param {number} adminId - Admin ID
 * @returns {Promise<Object>} Deactivated admin details
 */
export const deactivateCompanyAdmin = async (companyId, adminId) => {
  const response = await axiosClient.delete(
    `/admin/companies/${companyId}/admins/${adminId}`
  );
  return response.data;
};
