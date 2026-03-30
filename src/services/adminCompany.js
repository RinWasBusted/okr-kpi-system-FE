import axiosClient from '../utils/axios';

const buildAdminFormData = (data = {}) => {
  const formData = new FormData();

  if (data.full_name !== undefined) formData.append('full_name', data.full_name);
  if (data.email !== undefined) formData.append('email', data.email);
  if (data.password !== undefined) formData.append('password', data.password);
  if (data.avatar) formData.append('avatar', data.avatar);

  return formData;
};

/**
 * Get paginated list of admins in a company
 * API: GET /admin/companies/{company_id}/admins
 * @param {number} companyId - Company ID
 * @param {Object} [params] - Query parameters
 * @param {boolean} params.is_active - Filter by active status
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Number of records per page (default: 20)
 * @returns {Promise<Object>} API response with admin list and pagination metadata
 */
export const getCompanyAdmins = async (companyId, params = {}) => {
  const response = await axiosClient.get(`/admin/companies/${companyId}/admins`, { params });
  return response.data;
};

/**
 * Create a new company admin
 * API: POST /admin/companies/{company_id}/admins
 * Supports multipart/form-data with optional avatar file.
 * @param {number} companyId - Company ID
 * @param {FormData|Object} data - Admin payload
 * @param {string} data.full_name - Full name (required)
 * @param {string} data.email - Email address (required)
 * @param {string} data.password - Password, min 8 characters (required)
 * @param {File} [data.avatar] - Optional avatar image file
 * @returns {Promise<Object>} API response containing created admin data
 */
export const createCompanyAdmin = async (companyId, data) => {
  const payload = data instanceof FormData ? data : buildAdminFormData(data);
  const response = await axiosClient.post(`/admin/companies/${companyId}/admins`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update company admin profile/status
 * API: PUT /admin/companies/{company_id}/admins/{admin_id}
 * @param {number} companyId - Company ID
 * @param {number} adminId - Admin ID
 * @param {Object} data - Admin data to update
 * @param {string} data.full_name - Full name
 * @param {string} data.email - Email address
 * @param {string} data.password - Password (min 8 characters)
 * @param {boolean} data.is_active - Active status
 * @returns {Promise<Object>} API response containing updated admin data
 */
export const updateCompanyAdmin = async (companyId, adminId, data) => {
  const response = await axiosClient.put(
    `/admin/companies/${companyId}/admins/${adminId}`,
    data
  );
  return response.data;
};

/**
 * Upload/update admin avatar
 * API: PATCH /admin/companies/{company_id}/admins/{admin_id}/avatar
 * If no file is provided, backend can treat request as avatar removal.
 * @param {number} companyId - Company ID
 * @param {number} adminId - Admin ID
 * @param {File|null} [avatar] - Avatar image file
 * @returns {Promise<Object>} API response for avatar update
 */
export const uploadCompanyAdminAvatar = async (companyId, adminId, avatar = null) => {
  const formData = new FormData();
  if (avatar) {
    formData.append('avatar', avatar);
  }

  const response = await axiosClient.patch(
    `/admin/companies/${companyId}/admins/${adminId}/avatar`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Delete admin avatar
 * API: DELETE /admin/companies/{company_id}/admins/{admin_id}/avatar
 * @param {number} companyId - Company ID
 * @param {number} adminId - Admin ID
 * @returns {Promise<Object>} API response for avatar deletion
 */
export const deleteCompanyAdminAvatar = async (companyId, adminId) => {
  const response = await axiosClient.delete(
    `/admin/companies/${companyId}/admins/${adminId}/avatar`
  );
  return response.data;
};

/**
 * Deactivate company admin (soft delete)
 * API: DELETE /admin/companies/{company_id}/admins/{admin_id}
 * Sets `is_active = false` on backend.
 * @param {number} companyId - Company ID
 * @param {number} adminId - Admin ID
 * @returns {Promise<Object>} API response containing deactivated admin data
 */
export const deactivateCompanyAdmin = async (companyId, adminId) => {
  const response = await axiosClient.delete(
    `/admin/companies/${companyId}/admins/${adminId}`
  );
  return response.data;
};
