import axiosClient from '../utils/axios.js';

// ==================== OKR Assignments ====================

/**
 * Get list of OKR Assignments
 * @param {Object} params - Query parameters
 * @param {number} params.cycle_id - Filter by cycle
 * @param {number} params.unit_id - Filter by unit
 * @param {number} params.owner_id - Filter by owner
 * @param {string} params.visibility - Filter by visibility (PUBLIC, INTERNAL, PRIVATE)
 * @param {number} params.parent_assignment_id - Filter by parent assignment
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Records per page (default: 20)
 * @returns {Promise<Object>} OKR Assignments list with pagination metadata
 */
export const getOKRAssignments = async (params = {}) => {
  const response = await axiosClient.get('/objectives', { params });
  return response.data;
};

/**
 * Create a new OKR Assignment
 * @param {Object} data - OKR Assignment data
 * @param {number} data.okr_dictionary_id - OKR Dictionary ID (required)
 * @param {number} data.cycle_id - Cycle ID (required)
 * @param {number} data.target_value - Target value (required)
 * @param {number} data.current_value - Current value (defaults to 0)
 * @param {number} data.owner_id - Owner ID (for personal OKR)
 * @param {number} data.unit_id - Unit ID (for unit OKR)
 * @param {number} data.parent_assignment_id - Parent assignment ID
 * @param {string} data.visibility - Visibility (PUBLIC, INTERNAL, PRIVATE) (default: INTERNAL)
 * @returns {Promise<Object>} Created OKR Assignment
 */
export const createOKRAssignment = async (data) => {
  const response = await axiosClient.post('/okr-assignments', data);
  return response.data;
};

/**
 * Update an OKR Assignment
 * @param {number} id - OKR Assignment ID
 * @param {Object} data - Update data
 * @param {number} data.cycle_id - Cycle ID
 * @param {number} data.target_value - Target value
 * @param {number} data.current_value - Current value
 * @param {string} data.visibility - Visibility (PUBLIC, INTERNAL, PRIVATE)
 * @returns {Promise<Object>} Updated OKR Assignment
 */
export const updateOKRAssignment = async (id, data) => {
  const response = await axiosClient.put(`/okr-assignments/${id}`, data);
  return response.data;
};

/**
 * Delete an OKR Assignment
 * @param {number} id - OKR Assignment ID
 * @returns {Promise<Object>} API response
 */
export const deleteOKRAssignment = async (id) => {
  const response = await axiosClient.delete(`/okr-assignments/${id}`);
  return response.data;
};

/**
 * Get OKR Assignment details by ID
 * @param {number} id - OKR Assignment ID
 * @returns {Promise<Object>} OKR Assignment details
 */
export const getOKRAssignmentDetail = async (id) => {
  const response = await axiosClient.get(`/okr-assignments/${id}`);
  return response.data;
};
