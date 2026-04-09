import axiosClient from '../utils/axios';

/**
 * Get current ADMIN_COMPANY's company details
 * Returns detailed information about the company of the currently authenticated ADMIN_COMPANY user.
 * Company ID is extracted from the access token. Requires ADMIN_COMPANY role.
 * 
 * @returns {Promise<Object>} Company object containing:
 *   - id {number}: Company ID
 *   - name {string}: Company name (e.g., "Acme Corp")
 *   - slug {string}: Unique company slug (e.g., "acme-corp")
 *   - logo {string|null}: Cloudinary public_id (e.g., "okr-kpi-system/companies/logos/123456")
 *   - logo_url {string|null}: Full Cloudinary URL for display (e.g., "https://res.cloudinary.com/.../image.jpg")
 *   - is_active {boolean}: Company activation status
 *   - ai_plan {string}: AI plan type (FREE, SUBSCRIPTION, PAY_AS_YOU_GO)
 *   - token_usage {number}: Current token usage count
 *   - credit_cost {number}: Credit cost (float)
 *   - usage_limit {number}: Maximum token usage limit
 *   - admin_count {number}: Total number of admin users
 *   - employee_count {number}: Total number of employee users
 *   - created_at {string}: ISO 8601 creation timestamp
 * @throws {Error} 401 if unauthenticated or Company ID not found in token
 * @throws {Error} 403 if user doesn't have ADMIN_COMPANY role
 * @throws {Error} 404 if company not found
 */
export const getMyCompany = async () => {
  const response = await axiosClient.get('/admin/companies/me');
  return response.data;
};

/**
 * Get list of companies with pagination and filters
 * Returns a paginated list of companies with optional filters by status, AI plan, search keyword, and date range.
 * Results can be sorted by various fields.
 * 
 * @param {Object} params - Query parameters (all optional)
 * @param {boolean} [params.is_active] - Filter by active status (true = active, false = inactive/deactivated)
 * @param {string} [params.ai_plan] - Filter by AI plan type (FREE, SUBSCRIPTION, PAY_AS_YOU_GO)
 * @param {string} [params.search] - Search by name or slug (partial match, case-insensitive, max 255 chars)
 * @param {string} [params.from_date] - Filter companies created from this date (ISO 8601)
 * @param {string} [params.to_date] - Filter companies created until this date (ISO 8601)
 * @param {string} [params.sort_by='created_at'] - Field to sort by (name, created_at)
 * @param {string} [params.sort_order='desc'] - Sort direction (asc, desc)
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.per_page=20] - Records per page (default: 20, max: 100)
 * 
 * @returns {Promise<Object>} Paginated companies list containing:
 *   - data {Array}: Array of company objects, each containing:
 *     - id {number}, name {string}, slug {string}, logo_url {string|null}
 *     - is_active {boolean}, ai_plan {string}
 *     - admin_count {number}, employee_count {number}
 *     - created_at {string}
 *   - meta {Object}: Pagination metadata:
 *     - total {number}: Total companies matching filter
 *     - page {number}: Current page
 *     - per_page {number}: Records per page
 *     - last_page {number}: Total number of pages
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if access denied
 */
export const getCompanies = async (params = {}) => {
  const response = await axiosClient.get('/admin/companies', { params });
  return response.data;
};

/**
 * Get single company by ID
 * Returns detailed information about a specific company. Use getCompanyStats() instead if OKR/KPI statistics are needed.
 * 
 * @param {number} id - Company ID
 * 
 * @returns {Promise<Object>} Company object containing:
 *   - id {number}, name {string}, slug {string}
 *   - logo {string|null}, logo_url {string|null}
 *   - is_active {boolean}
 *   - ai_plan {string}: (FREE, SUBSCRIPTION, PAY_AS_YOU_GO)
 *   - token_usage {number}, credit_cost {number}, usage_limit {number}
 *   - admin_count {number}, employee_count {number}
 *   - created_at {string}
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if access denied
 * @throws {Error} 404 if company not found
 */
export const getCompanyById = async (id) => {
  const response = await axiosClient.get(`/admin/companies/${id}`);
  return response.data;
};

/**
 * Create new company
 * Creating a new company requires a unique slug. The slug is used as a unique identifier for the company 
 * across the platform, especially during login. Slug format must be lowercase letters, numbers, and hyphens 
 * (3-60 characters). Optionally upload a logo image file.
 * 
 * @param {Object} data - Company creation data
 * @param {string} data.name - Company name (1-255 chars, required)
 * @param {string} data.slug - Unique company slug (3-60 chars, lowercase letters/numbers/hyphens only, required)
 * @param {string} [data.ai_plan='FREE'] - AI plan type (FREE, SUBSCRIPTION, PAY_AS_YOU_GO)
 * @param {File} [data.file] - Optional company logo image file (max 2MB, must be image format)
 * 
 * @returns {Promise<Object>} Created company object (nested under data.company):
 *   - id {number}, name {string}, slug {string}
 *   - logo {string|null}: Cloudinary public_id
 *   - logo_url {string|null}: Full Cloudinary URL
 *   - is_active {boolean}: Always true for new company
 *   - ai_plan {string}
 *   - admin_count {number}: Always 0 for new company
 *   - employee_count {number}: Always 0 for new company
 *   - created_at {string}
 * @throws {Error} 400 if file is invalid (not an image or exceeds 2MB)
 * @throws {Error} 409 if slug already exists on the platform
 * @throws {Error} 422 if validation error (invalid slug format, name too short, etc.)
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if access denied
 */
export const createCompany = async (data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('slug', data.slug);
  
  // Append optional ai_plan if provided
  if (data.ai_plan) {
    formData.append('ai_plan', data.ai_plan);
  }

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
 * Update company name, slug, activation status, AI plan, or usage limit. 
 * Note: token_usage and credit_cost cannot be modified directly via this endpoint; use the AI usage management 
 * endpoint instead.
 * 
 * @param {number} id - Company ID
 * @param {Object} data - Company data to update (all fields optional)
 * @param {string} [data.name] - New company name (1-255 chars)
 * @param {string} [data.slug] - New unique slug (3-60 chars, lowercase letters/numbers/hyphens only)
 * @param {boolean} [data.is_active] - Company status (false = deactivate and lock, true = reactivate)
 * @param {string} [data.ai_plan] - AI plan type (FREE, SUBSCRIPTION, PAY_AS_YOU_GO)
 * @param {number} [data.usage_limit] - Maximum token usage limit
 * 
 * @returns {Promise<Object>} Updated company object containing:
 *   - id {number}, name {string}, slug {string}
 *   - logo {string|null}, logo_url {string|null}
 *   - is_active {boolean}
 *   - ai_plan {string}
 *   - token_usage {number}, credit_cost {number}, usage_limit {number}
 *   - admin_count {number}, employee_count {number}
 *   - created_at {string}
 * @throws {Error} 404 if company not found
 * @throws {Error} 409 if new slug already exists on the platform
 * @throws {Error} 422 if validation error (slug too short, invalid format, etc.)
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if access denied
 */
export const updateCompany = async (id, data) => {
  const response = await axiosClient.put(`/admin/companies/${id}`, data);
  return response.data;
};

/**
 * Deactivate a company (soft delete)
 * Sets is_active = false. All users in the company lose login access. Data is not physically deleted.
 * Returns the number of affected users.
 * 
 * @param {number} id - Company ID
 * 
 * @returns {Promise<Object>} Deactivation result containing:
 *   - id {number}: Company ID
 *   - is_active {boolean}: Always false after deactivation
 *   - affected_users {number}: Number of users who lost access
 * @throws {Error} 404 if company not found
 * @throws {Error} 409 if company is already deactivated
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if access denied
 */
export const deactivateCompany = async (id) => {
  const response = await axiosClient.delete(`/admin/companies/${id}`);
  return response.data;
};

/**
 * Get company overview statistics with company details
 * Returns company information along with comprehensive aggregated OKR/KPI statistics in a single call.
 * 
 * @param {number} id - Company ID
 * 
 * @returns {Promise<Object>} Company data including basic info and statistics:
 *   Basic Information:
 *   - id {number}, name {string}, slug {string}
 *   - logo {string|null}, logo_url {string|null}
 *   - is_active {boolean}
 *   - created_at {string}
 *   
 *   AI & Usage:
 *   - ai_plan {string}: (FREE, SUBSCRIPTION, PAY_AS_YOU_GO)
 *   - token_usage {number}: Current token usage count
 *   - credit_cost {number}: Credit cost (float)
 *   - usage_limit {number}: Maximum token usage limit
 *   
 *   User Counts:
 *   - admin_count {number}: Total admin users
 *   - employee_count {number}: Total employee users
 *   
 *   OKR/KPI Statistics:
 *   - total_objectives {number}: Total objectives across all cycles
 *   - total_cycles {number}: Total cycles (active and inactive)
 *   - total_key_results {number}: Total key results across all objectives
 *   - active_objectives {number}: Number of objectives currently in Active status
 *   - completion_rate {number}: Completion rate of objectives (0.0 to 1.0, e.g., 0.72 = 72%)
 * @throws {Error} 404 if company not found
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if access denied
 */
export const getCompanyStats = async (id) => {
  const response = await axiosClient.get(`/admin/companies/${id}/stats`);
  return response.data;
};

/**
 * Upload or update company logo
 * Upload a new logo for the company. Logo must be an image file (max 2MB). 
 * To delete a logo, use deleteCompanyLogo() instead.
 * 
 * @param {number} id - Company ID
 * @param {File} file - Logo image file (required, max 2MB, must be image - jpg, png, gif, webp)
 * 
 * @returns {Promise<Object>} Updated company object containing:
 *   - id {number}, name {string}
 *   - logo {string}: Cloudinary public_id (e.g., "okr-kpi-system/companies/logos/1234567890")
 *   - logo_url {string}: Full Cloudinary URL for display (e.g., "https://res.cloudinary.com/.../image.jpg")
 * @throws {Error} 400 if file is invalid (not an image or exceeds 2MB)
 * @throws {Error} 404 if company not found
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if access denied
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
 * Delete the company's logo. This operation is idempotent - returns 200 whether logo exists or not.
 * 
 * @param {number} id - Company ID
 * 
 * @returns {Promise<Object>} Company object with logo deleted:
 *   - id {number}, name {string}
 *   - logo {null}: Always null after deletion
 *   - logo_url {null}: Always null after deletion
 * @throws {Error} 404 if company not found
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if access denied
 */
export const deleteCompanyLogo = async (id) => {
  const response = await axiosClient.delete(`/admin/companies/${id}/logo`);
  return response.data;
};

// ==================== COMPANY-LEVEL ENDPOINTS (ADMIN_COMPANY role) ====================

/**
 * Get own company information (ADMIN_COMPANY role)
 * Returns information about the company the authenticated ADMIN_COMPANY user belongs to.
 * 
 * @returns {Promise<Object>} Company information containing:
 *   - id {number}: Company ID
 *   - name {string}: Company name (e.g., "Acme Corp")
 *   - slug {string}: Company slug (e.g., "acme-corp")
 *   - logo_url {string|null}: Full Cloudinary URL for display
 *   - is_active {boolean}: Company activation status
 *   - ai_plan {string}: AI plan type (FREE, SUBSCRIPTION, PAY_AS_YOU_GO)
 *   - token_usage {number}: Current token usage count
 *   - credit_cost {number}: Credit cost (float)
 *   - usage_limit {number}: Maximum token usage limit
 *   - created_at {string}: ISO 8601 creation timestamp
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if user doesn't have ADMIN_COMPANY role
 */
export const getMyCompanyInfo = async () => {
  const response = await axiosClient.get('/company/me');
  return response.data;
};

/**
 * Get company statistics (ADMIN_COMPANY role)
 * Returns statistics about the company including OKR progress, KPI health, and AI usage information.
 * 
 * @returns {Promise<Object>} Company stats containing:
 *   - id {number}: Company ID
 *   - name {string}: Company name
 *   - is_active {boolean}: Company activation status
 *   - created_at {string}: ISO 8601 creation timestamp
 *   - ai_plan {string}: AI plan type (FREE, SUBSCRIPTION, PAY_AS_YOU_GO)
 *   
 *   AI Usage:
 *   - token_usage {number}: Number of tokens used for AI features
 *   - usage_limit {number}: Monthly token usage limit
 *   - credit_cost {number}: Total AI credit cost incurred (float)
 *   
 *   OKR Progress:
 *   - okr_progress {number}: Average progress percentage of company-level objectives (unit_id = null)
 *   - total_okr {number}: Total number of company-level objectives
 *   
 *   KPI Health:
 *   - kpi_health {number}: Average progress percentage of company-level KPI assignments (unit_id = null)
 *   - total_kpi {number}: Total number of company-level KPI assignments
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if user doesn't have ADMIN_COMPANY role
 */
export const getMyCompanyStats = async () => {
  const response = await axiosClient.get('/company/stats');
  return response.data;
};

/**
 * Upload or update company logo (ADMIN_COMPANY role)
 * Upload or update the logo for the authenticated user's company.
 * Logo must be an image file (JPG, PNG, etc.).
 * 
 * @param {File} file - Logo image file (required)
 * 
 * @returns {Promise<Object>} Updated company object containing:
 *   - id {number}: Company ID
 *   - name {string}: Company name
 *   - logo_url {string}: Full Cloudinary URL for the uploaded logo
 * @throws {Error} 400 if no file provided or upload failed
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if user doesn't have ADMIN_COMPANY role
 */
export const uploadMyCompanyLogo = async (file) => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }

  const response = await axiosClient.patch('/company/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete company logo (ADMIN_COMPANY role)
 * Remove the logo from the authenticated user's company.
 * 
 * @returns {Promise<Object>} Company object with logo deleted:
 *   - id {number}: Company ID
 *   - name {string}: Company name
 *   - logo_url {null}: Always null after deletion
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if user doesn't have ADMIN_COMPANY role
 */
export const deleteMyCompanyLogo = async () => {
  const response = await axiosClient.delete('/company/logo');
  return response.data;
};

/**
 * Get company AI usage logs (ADMIN_COMPANY role)
 * Returns AI usage logs for the authenticated user's company with optional filters and pagination.
 * 
 * @param {Object} params - Query parameters (all optional)
 * @param {number} [params.user_id] - Filter by specific user ID
 * @param {string} [params.feature_name] - Filter by feature name (partial match)
 * @param {string} [params.model_name] - Filter by model name (partial match)
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.start_date] - Filter from this date (ISO 8601)
 * @param {string} [params.end_date] - Filter until this date (ISO 8601)
 * @param {number} [params.min_credit_cost] - Minimum credit cost filter
 * @param {number} [params.max_credit_cost] - Maximum credit cost filter
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.per_page=20] - Records per page (max 100)
 * 
 * @returns {Promise<Object>} AI usage logs containing:
 *   - data {Array}: Array of AI usage log objects, each containing:
 *     - id {number}: Log ID
 *     - company {Object}: {id {number}, name {string}}
 *     - user {Object}: {id {number}, full_name {string}, email {string}}
 *     - feature_name {string}: Name of the feature that used AI
 *     - model_name {string}: AI model used (e.g., "gpt-4")
 *     - input_tokens {number}: Input tokens consumed
 *     - output_tokens {number}: Output tokens consumed
 *     - total_tokens {number}: Total tokens (input + output)
 *     - request_id {string}: Unique request identifier
 *     - credit_cost {number}: Credit cost for this request
 *     - status {string}: Request status
 *     - created_at {string}: ISO 8601 timestamp
 *   - meta {Object}: Pagination metadata:
 *     - total {number}: Total logs matching filters
 *     - page {number}: Current page
 *     - per_page {number}: Records per page
 *     - last_page {number}: Total number of pages
 * @throws {Error} 401 if unauthenticated
 * @throws {Error} 403 if user doesn't have ADMIN_COMPANY role
 */
export const getCompanyAIUsageLogs = async (params = {}) => {
  const response = await axiosClient.get('/company/ai-usage/logs', { params });
  return response.data;
};
