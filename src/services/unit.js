import axiosClient from '../utils/axios.js';

/**
 * Get list of units
 * @param {Object} params - Query parameters
 * @param {number} params.page - Current page number (default: 1)
 * @param {number} params.per_page - Records per page (default: 100)
 * @param {string} params.mode - Units retrieval mode (optional, value = "tree" returns hierarchical structure with sub_units, "list" returns flat list)
 * @returns {Promise} API response with units list
 */
export const getUnits = async (params = {}) => {
  const response = await axiosClient.get('/units', { params });
  return response.data;
};

/**
 * Create a new unit
 * @param {Object} data - Unit data
 * @param {string} data.name - Unit name (required)
 * @param {number} data.parent_id - ID of parent unit (optional)
 * @param {number} data.manager_id - user_id of unit manager (optional)
 * @returns {Promise} API response with created unit
 */
export const createUnit = async (data) => {
  const response = await axiosClient.post('/units', data);
  return response.data;
};

/**
 * Update unit information
 * @param {number} id - Unit ID
 * @param {Object} data - Unit update data
 * @param {string} data.name - Unit name (optional)
 * @param {number} data.parent_id - New parent unit ID, set null for top-level (optional)
 * @param {number} data.manager_id - New manager user_id, set null to remove (optional)
 * @returns {Promise} API response with updated unit
 */
export const updateUnit = async (id, data) => {
  const response = await axiosClient.put(`/units/${id}`, data);
  return response.data;
};

/**
 * Delete a unit
 * @param {number} id - Unit ID
 * @returns {Promise} API response (204 No Content on success)
 */
export const deleteUnit = async (id) => {
  const response = await axiosClient.delete(`/units/${id}`);
  return response.data;
};

/**
 * Get unit details by ID
 * @param {number} id - Unit ID
 * @returns {Promise} API response with unit details
 */
export const getUnitDetail = async (id) => {
  const response = await axiosClient.get(`/units/${id}/detail`);
  return response.data;
};

/**
 * Get members/users of a unit
 * @param {number} unitId - Unit ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Current page number (default: 1)
 * @param {number} params.per_page - Records per page (default: 100)
 * @returns {Promise} API response with unit members list
 */
export const getUnitMembers = async (unitId, params = {}) => {
  const response = await axiosClient.get(`/units/${unitId}/members`, { params });
  return response.data;
};
