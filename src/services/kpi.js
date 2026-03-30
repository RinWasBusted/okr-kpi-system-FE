import axiosClient from '../utils/axios.js';

// ==================== KPI Assignments ====================

/**
 * Get list of KPI Assignments
 * @param {Object} params - Query parameters
 * @param {number} params.cycle_id - Filter by cycle
 * @param {number} params.unit_id - Filter by unit
 * @param {number} params.owner_id - Filter by owner
 * @param {string} params.visibility - Filter by visibility (PUBLIC, INTERNAL, PRIVATE)
 * @param {number} params.parent_assignment_id - Filter by parent assignment
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Records per page (default: 20)
 * @returns {Promise<Object>} KPI Assignments list with pagination metadata
 */
export const getKPIAssignments = async (params = {}) => {
  const response = await axiosClient.get('/kpi-assignments', { params });
  return response.data;
};

/**
 * Create a new KPI Assignment
 * @param {Object} data - KPI Assignment data
 * @param {number} data.kpi_dictionary_id - KPI Dictionary ID (required)
 * @param {number} data.cycle_id - Cycle ID (required)
 * @param {number} data.target_value - Target value (required)
 * @param {number} data.current_value - Current value (defaults to 0)
 * @param {number} data.owner_id - Owner ID (for personal KPI)
 * @param {number} data.unit_id - Unit ID (for unit KPI)
 * @param {number} data.parent_assignment_id - Parent assignment ID
 * @param {string} data.visibility - Visibility (PUBLIC, INTERNAL, PRIVATE) (default: INTERNAL)
 * @returns {Promise<Object>} Created KPI Assignment
 */
export const createKPIAssignment = async (data) => {
  const response = await axiosClient.post('/kpi-assignments', data);
  return response.data;
};

/**
 * Update a KPI Assignment
 * @param {number} id - KPI Assignment ID
 * @param {Object} data - Update data
 * @param {number} data.cycle_id - Cycle ID
 * @param {number} data.target_value - Target value
 * @param {number} data.current_value - Current value
 * @param {string} data.visibility - Visibility (PUBLIC, INTERNAL, PRIVATE)
 * @returns {Promise<Object>} Updated KPI Assignment
 */
export const updateKPIAssignment = async (id, data) => {
  const response = await axiosClient.put(`/kpi-assignments/${id}`, data);
  return response.data;
};

/**
 * Delete a KPI Assignment
 * @param {number} id - KPI Assignment ID
 * @param {boolean} cascade - If true, soft delete all descendants recursively
 * @returns {Promise<void>} No response body (204 status)
 */
export const deleteKPIAssignment = async (id, cascade = false) => {
  const response = await axiosClient.delete(`/kpi-assignments/${id}`, {
    params: { cascade }
  });
  return response.data;
};

// ==================== KPI Dictionaries ====================

/**
 * Get list of KPI Dictionaries
 * @returns {Promise<Object>} KPI Dictionaries list
 */
export const getKPIDictionaries = async () => {
  const response = await axiosClient.get('/kpi-dictionaries');
  return response.data;
};

/**
 * Create a new KPI Dictionary
 * @param {Object} data - KPI Dictionary data
 * @param {string} data.name - KPI name (required)
 * @param {string} data.unit - Unit of measurement (VNĐ, %, Số lượng, etc.) (required)
 * @param {string} data.evaluation_method - Evaluation method (Positive, Negative, Stabilizing) (required)
 * @param {number} data.unit_id - Unit ID (null for company-wide)
 * @returns {Promise<Object>} Created KPI Dictionary
 */
export const createKPIDictionary = async (data) => {
  const response = await axiosClient.post('/kpi-dictionaries', data);
  return response.data;
};

/**
 * Update a KPI Dictionary
 * @param {number} id - KPI Dictionary ID
 * @param {Object} data - Update data
 * @param {string} data.name - KPI name
 * @param {string} data.unit - Unit of measurement
 * @param {string} data.evaluation_method - Evaluation method (Positive, Negative, Stabilizing)
 * @param {number} data.unit_id - Unit ID
 * @returns {Promise<Object>} Updated KPI Dictionary
 */
export const updateKPIDictionary = async (id, data) => {
  const response = await axiosClient.put(`/kpi-dictionaries/${id}`, data);
  return response.data;
};

/**
 * Delete a KPI Dictionary
 * @param {number} id - KPI Dictionary ID
 * @returns {Promise<void>} No response body (204 status)
 */
export const deleteKPIDictionary = async (id) => {
  const response = await axiosClient.delete(`/kpi-dictionaries/${id}`);
  return response.data;
};

// ==================== KPI Records ====================

/**
 * Create a KPI Record
 * @param {number} assignmentId - KPI Assignment ID
 * @param {Object} data - KPI Record data
 * @param {string} data.period_start - Period start date (YYYY-MM-DD) (required)
 * @param {string} data.period_end - Period end date (YYYY-MM-DD) (required)
 * @param {number} data.actual_value - Actual achieved value (required)
 * @returns {Promise<Object>} Created KPI Record with calculated metrics
 */
export const createKPIRecord = async (assignmentId, data) => {
  const response = await axiosClient.post(`/kpi-assignments/${assignmentId}/records`, data);
  return response.data;
};

/**
 * Get KPI Records history
 * @param {number} assignmentId - KPI Assignment ID
 * @returns {Promise<Object>} KPI Records history list
 */
export const getKPIRecords = async (assignmentId) => {
  const response = await axiosClient.get(`/kpi-assignments/${assignmentId}/records`);
  return response.data;
};
