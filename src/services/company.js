import axiosClient from '../utils/axios';

/**
 * Get current ADMIN_COMPANY's company details
 * Company ID is derived from authenticated access token on server
 * @returns {Promise<Object>} Company details including:
 *   - id, name, slug, logo, logo_url, is_active, created_at
 *   - ai_plan, token_usage, credit_cost, usage_limit
 *   - admin_count, employee_count
 */
export const getMyCompany = async () => {
  const response = await axiosClient.get('/admin/companies/me');
  return response.data;
};

/**
 * Get list of companies with pagination and filters
 * @param {Object} params - Query parameters
 * @param {boolean} params.is_active - Filter by active status
 * @param {string} params.search - Search by name or slug
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Records per page (default: 20, max: 100)
 * @returns {Promise<Object>} Company list with pagination metadata
 */
export const getCompanies = async (params = {}) => {
  const response = await axiosClient.get('/admin/companies', { params });
  return response.data;
};

/**
 * Get single company by ID
 * @param {number} id - Company ID
 * @returns {Promise<Object>} Company details
 */
export const getCompanyById = async (id) => {
  const response = await axiosClient.get(`/admin/companies/${id}`);
  return response.data;
};

/**
 * Create new company
 * @param {Object} data - Company data
 * @param {string} data.name - Company name (required)
 * @param {string} data.slug - Unique company slug (required)
 * @param {File} data.file - Optional company logo image file
 * @returns {Promise<Object>} Created company
 */
export const createCompany = async (data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('slug', data.slug);

  // Append file if provided
  if (data.file) {
    formData.append('file', data.file);
  }

  const response = await axiosClient.post('/admin/companies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update company information
 * @param {number} id - Company ID
 * @param {Object} data - Company data to update
 * @param {string} data.name - New company name
 * @param {string} data.slug - New unique slug
 * @param {boolean} data.is_active - Company status (false = lock the entire company)
 * @param {'FREE'|'SUBSCRIPTION'|'PAY_AS_YOU_GO'} data.ai_plan - AI plan type
 * @param {number} data.token_usage - Current token usage
 * @param {number} data.credit_cost - Credit cost
 * @param {number} data.usage_limit - Usage limit
 * @returns {Promise<Object>} Updated company
 */
export const updateCompany = async (id, data) => {
  const response = await axiosClient.put(`/admin/companies/${id}`, data);
  return response.data;
};

/**
 * Deactivate a company (soft delete)
 * Sets is_active = false. All users lose login access. Data is not physically deleted.
 * @param {number} id - Company ID
 * @returns {Promise<void>} No response body (204 status)
 */
export const deactivateCompany = async (id) => {
  const response = await axiosClient.delete(`/admin/companies/${id}`);
  return response.data;
};

/**
 * Get company overview statistics with company details
 * Returns company information along with aggregated statistics in a single call
 * @param {number} id - Company ID
 * @returns {Promise<Object>} Company data including:
 *   - id, name, slug, is_active, created_at
 *   - logo, logo_url
 *   - admin_count, employee_count, active_cycles, total_objectives
 *   - ai_plan, token_usage, credit_cost, usage_limit
 */
export const getCompanyStats = async (id) => {
  const response = await axiosClient.get(`/admin/companies/${id}/stats`);
  return response.data;
};

/**
 * Upload or update company logo
 * If file is omitted/null, backend may treat as delete based on API behavior
 * @param {number} id - Company ID
 * @param {File|null} file - Logo image file
 * @returns {Promise<Object>} Updated company logo response
 */
export const uploadCompanyLogo = async (id, file) => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }

  const response = await axiosClient.patch(`/admin/companies/${id}/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete company logo
 * @param {number} id - Company ID
 * @returns {Promise<Object>} Company data with logo set to null
 */
export const deleteCompanyLogo = async (id) => {
  const response = await axiosClient.delete(`/admin/companies/${id}/logo`);
  return response.data;
};
