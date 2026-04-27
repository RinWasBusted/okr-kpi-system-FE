import axiosClient from '../utils/axios.js';

// ==================== CHECK-INS ====================

/**
 * Create a new check-in for a key result
 * 
 * @async
 * @function createCheckIn
 * @param {number} krId - The key result ID (path parameter)
 * @param {Object} payload - Request payload
 * @param {number} payload.achieved_value - The achieved value for this check-in (required)
 * @param {string} payload.evidence_url - URL to evidence of achievement (required, max 2048 characters)
 * @param {string} [payload.comment] - Optional comment about the check-in (max 1000 characters)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Check-in data
 * @returns {number} response.data.id - Check-in ID
 * @returns {number} response.data.achieved_value - The achieved value submitted
 * @returns {number} response.data.progress_snapshot - Progress percentage at time of check-in (2 decimal places)
 * @returns {number} response.data.kr_progress - Current key result progress percentage (2 decimal places)
 * @returns {number} response.data.objective_progress - Updated objective progress percentage (2 decimal places)
 * @returns {string} response.data.evidence_url - URL to evidence
 * @returns {string} [response.data.comment] - Comment (if provided)
 * @returns {string} response.data.created_at - Creation timestamp (ISO 8601 format)
 * 
 * @throws {Error} 400 - Invalid key result ID
 * @throws {Error} 403 - No permission to check in to this objective
 * @throws {Error} 404 - Key result not found
 * @throws {Error} 422 - Validation error (missing or invalid fields)
 * 
 * @example
 * const payload = {
 *   achieved_value: 75.5,
 *   evidence_url: "https://example.com/evidence.pdf",
 *   comment: "Completed 75% of the target"
 * };
 * const response = await createCheckIn(123, payload);
 */
export const createCheckIn = async (krId, payload) => {
  try {
    const response = await axiosClient.post(
      `/key-results/${krId}/check-ins`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get check-in history for a key result
 * 
 * @async
 * @function getCheckIns
 * @param {number} krId - The key result ID (path parameter)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of check-in objects
 * @returns {number} response.data[].id - Check-in ID
 * @returns {number} response.data[].achieved_value - The achieved value submitted
 * @returns {number} response.data[].progress_snapshot - Progress percentage at time of this check-in (2 decimal places)
 * @returns {string} response.data[].evidence_url - URL to evidence
 * @returns {string} [response.data[].comment] - Comment (if provided)
 * @returns {string} response.data[].created_at - Creation timestamp (ISO 8601 format)
 * 
 * @throws {Error} 400 - Invalid key result ID
 * @throws {Error} 403 - No permission to view this objective
 * @throws {Error} 404 - Key result not found
 * 
 * @example
 * const checkIns = await getCheckIns(123);
 * console.log(checkIns.data); // Array of check-ins sorted by creation date
 */
export const getCheckIns = async (krId) => {
  try {
    const response = await axiosClient.get(
      `/key-results/${krId}/check-ins`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all check-in history for an objective
 * 
 * @async
 * @function getObjectiveCheckIns
 * @param {number} objectiveId - The objective ID
 * @returns {Promise<Object>} Response object
 */
export const getObjectiveCheckIns = async (objectiveId) => {
  try {
    const response = await axiosClient.get(
      `/objectives/${objectiveId}/check-ins`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recent check-in activities performed by the current user
 * 
 * @async
 * @function getMyCheckInActivities
 * @param {Object} params - Query parameters
 * @param {number} [params.cycle_id] - Filter by cycle
 * @param {number} [params.limit=10] - Max records to return
 * @returns {Promise<Object>} Response object
 */
export const getMyCheckInActivities = async (params) => {
  try {
    const response = await axiosClient.get('/my-activities', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
