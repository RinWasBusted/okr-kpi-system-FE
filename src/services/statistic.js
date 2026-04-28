import axiosClient from '../utils/axios.js';

/**
 * Get KPI timeline data for chart visualization
 * @param {Object} params - Query parameters
 * @param {number} params.cycle_id - Cycle ID (required)
 * @param {string} [params.group_by] - Aggregation level: 'month' (weekly) or 'year' (monthly)
 * @param {number} [params.unit_id] - Filter by unit ID
 * @param {number} [params.user_id] - Filter by user ID
 */
export const getKPITimeline = async (params = {}) => {
  const response = await axiosClient.get('/statistics/kpi-timeline', { params });
  return response.data;
};

/**
 * Get OKR timeline data for chart visualization
 * @param {Object} params - Query parameters
 * @param {number} params.cycle_id - Cycle ID (required)
 * @param {string} [params.group_by] - Aggregation level: 'month' (weekly) or 'year' (monthly)
 * @param {number} [params.unit_id] - Filter by unit ID
 * @param {number} [params.user_id] - Filter by user ID
 */
export const getOKRTimeline = async (params = {}) => {
  const response = await axiosClient.get('/statistics/okr-timeline', { params });
  return response.data;
};

/**
 * Get unit evaluations for a specific cycle
 * @param {number} unitId - Unit ID
 * @param {number} cycleId - Cycle ID
 */
export const getUnitEvaluations = async (unitId, cycleId) => {
  const response = await axiosClient.get(`/units/${unitId}/evaluations`, {
    params: { cycle_id: cycleId },
  });
  return response.data;
};

/**
 * Get list of all company employees with their evaluation information
 * @async
 * @function getCompanyEmployeesEvaluations
 * @description Retrieves a list of all active employees in the company along with their evaluation data for a specific cycle.
 * Includes basic employee information (user_id, full_name, email, avatar_url, job_title) and evaluation metrics 
 * (id, cycle_id, avg_kpi_progress, z_score, verdict) from the Evaluations table if available.
 * Requires accessToken cookie and ADMIN_COMPANY role.
 * 
 * @param {Object} params - Query parameters (required)
 * @param {string|number} params.cycle_id - The ID of the evaluation cycle (required, pattern: ^\d+$)
 * 
 * @returns {Promise<Object>} Response object (HTTP 200 OK)
 * @returns {boolean} response.success - Whether request was successful (true on success)
 * @returns {string} response.message - Response message (e.g., "Company employees evaluations retrieved successfully")
 * @returns {number} response.status - HTTP status code (200)
 * @returns {Array<Object>} response.data - Array of employee evaluation objects
 * 
 * @returns {number} response.data[].user_id - Employee user ID (e.g., 10)
 * @returns {string} response.data[].full_name - Employee full name (e.g., "Nguyễn Văn A")
 * @returns {string} response.data[].email - Employee email address (e.g., "nguyenvana@example.com")
 * @returns {string} [response.data[].avatar_url] - Employee avatar URL (nullable, format: url)
 * @returns {string} [response.data[].job_title] - Employee job title (nullable, e.g., "Developer")
 * @returns {number} [response.data[].id] - Evaluation record ID (nullable, e.g., 1)
 * @returns {number} [response.data[].cycle_id] - Cycle ID from evaluation record (nullable, e.g., 1)
 * @returns {number} [response.data[].avg_kpi_progress] - Average KPI progress percentage (nullable, e.g., 85.5)
 * @returns {number} [response.data[].z_score] - Z-score for statistical analysis (nullable, e.g., 1.25)
 * @returns {string} [response.data[].verdict] - Evaluation verdict (nullable, e.g., "AVERAGE")
 * 
 * @throws {Error} 400 Bad Request - Invalid query parameters (invalid cycle_id format)
 * @throws {Error} 403 Forbidden - Access denied (requires ADMIN_COMPANY role or missing company context)
 * @throws {Error} 404 Not Found - Cycle not found
 * @throws {Error} 500 Internal Server Error - Server error
 * 
 * @example
 * const evaluations = await getCompanyEmployeesEvaluations({ cycle_id: '1' });
 * evaluations.data.forEach(emp => {
 *   console.log(`${emp.full_name}: ${emp.avg_kpi_progress}% (${emp.verdict})`);
 * });
 */
export const getCompanyEmployeesEvaluations = async (params = {}) => {
  const response = await axiosClient.get('/evaluations/employees', { params });
  return response.data;
};
