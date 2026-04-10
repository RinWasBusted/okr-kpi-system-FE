import axiosClient from '../utils/axios.js';

// ==================== KEY RESULTS ====================

/**
 * Get key results for an objective
 * @async
 * @function getKeyResults
 * @param {number} objective_id - The objective ID (required)
 * @param {Object} [params] - Additional query parameters (optional)
 * @param {number} [params.page=1] - Current page number (optional)
 * @param {number} [params.per_page=20] - Records per page (optional, default 20, max 100)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of key result objects
 * @returns {number} response.data[].id - Key result ID
 * @returns {string} response.data[].title - Key result title
 * @returns {number} response.data[].target_value - Target value to achieve
 * @returns {number} response.data[].current_value - Current value progress
 * @returns {string} response.data[].unit - Unit of measurement
 * @returns {number} response.data[].weight - Weight percentage (0-100)
 * @returns {string} [response.data[].due_date] - Due date (format: YYYY-MM-DD, nullable)
 * @returns {number} response.data[].progress_percentage - Progress percentage (current_value / target_value * 100)
 * @returns {number} [response.data[].days_until_due] - Days remaining until due date (nullable)
 * @returns {Object} response.meta - Pagination metadata
 * @returns {number} response.meta.total - Total number of key results
 * @returns {number} response.meta.page - Current page number
 * @returns {number} response.meta.per_page - Records per page
 * @returns {number} response.meta.last_page - Last page number
 * 
 * @throws {Error} If request fails:
 *   - 400: Invalid objective ID
 *   - 403: No permission to view this objective
 *   - 404: Objective not found
 * 
 * @description Retrieve all key results associated with a specific objective.
 * Results are paginated and include progress information.
 * 
 * @example
 * const keyResults = await getKeyResults(1, { page: 1, per_page: 20 });
 */
export const getKeyResults = async (objective_id, params = {}) => {
  const response = await axiosClient.get(`/objectives/${objective_id}/key-results`, { params });
  return response.data;
};

/**
 * Create a new key result for an objective
 * @async
 * @function createKeyResult
 * @param {number} objective_id - The objective ID (required, in path)
 * @param {Object} data - Key result data
 * @param {string} data.title - Key result title (required, 1-255 characters)
 * @param {number} data.target_value - Target value to achieve (required, must be > 0)
 * @param {string} data.unit - Unit of measurement (required, 1-50 characters, e.g., '%', 'users', 'million')
 * @param {number} data.weight - Weight percentage (required, 0-100)
 * @param {number} [data.current_value] - Current value progress (optional, default: 0, must be >= 0)
 * @param {string} [data.due_date] - Due date in YYYY-MM-DD format (optional)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "Key result created successfully")
 * @returns {Object} response.data - Created key result object
 * @returns {Object} response.data.key_result - Key result details
 * @returns {number} response.data.key_result.id - Key result ID
 * @returns {string} response.data.key_result.title - Key result title
 * @returns {number} response.data.key_result.target_value - Target value
 * @returns {number} response.data.key_result.current_value - Current value (initially 0 or provided value)
 * @returns {string} response.data.key_result.unit - Unit of measurement
 * @returns {number} response.data.key_result.weight - Weight percentage
 * @returns {string} [response.data.key_result.due_date] - Due date (nullable)
 * @returns {number} response.data.key_result.progress_percentage - Progress percentage (0-100)
 * @returns {number} response.data.key_result.objective_id - Associated objective ID
 * 
 * @throws {Error} If creation fails:
 *   - 400: Invalid objective ID
 *   - 403: No permission to edit this objective
 *   - 404: Objective not found
 *   - 422: Validation error (missing or invalid fields)
 * 
 * @description Create a new key result for tracking progress toward an objective.
 * All required fields must be provided.
 * 
 * @example
 * const newKR = await createKeyResult(1, {
 *   title: 'Increase user engagement',
 *   target_value: 100,
 *   current_value: 0,
 *   unit: 'users',
 *   weight: 50,
 *   due_date: '2026-06-30'
 * });
 */
export const createKeyResult = async (objective_id, data) => {
  const response = await axiosClient.post(`/objectives/${objective_id}/key-results`, data);
  return response.data;
};

/**
 * Create multiple key results for an objective (batch operation)
 * @async
 * @function createBatchKeyResults
 * @param {number} objective_id - The objective ID (required, in path)
 * @param {Object} data - Batch creation data
 * @param {Array<Object>} data.key_results - Array of key results to create (required, 1-50 items)
 * @param {string} data.key_results[].title - Key result title (required, 1-255 characters)
 * @param {number} data.key_results[].target_value - Target value to achieve (required, must be > 0)
 * @param {string} data.key_results[].unit - Unit of measurement (required, 1-50 characters, e.g., '%', 'users', 'revenue')
 * @param {number} data.key_results[].weight - Weight percentage (required, 0-100)
 * @param {number} [data.key_results[].current_value] - Current value progress (optional, default: 0, must be >= 0)
 * @param {string} [data.key_results[].due_date] - Due date in YYYY-MM-DD format (optional)
 * @param {string} [data.key_results[].evaluation_method] - Evaluation method (optional, default: MAXIMIZE)
 *   - 'MAXIMIZE' - Maximize the metric value
 *   - 'MINIMIZE' - Minimize the metric value
 *   - 'TARGET' - Reach a specific target value
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "Key results created successfully")
 * @returns {Object} response.data - Created key results object
 * @returns {Array<Object>} response.data.key_results - Array of created key result objects
 * @returns {number} response.data.key_results[].id - Key result ID
 * @returns {string} response.data.key_results[].title - Key result title
 * @returns {number} response.data.key_results[].target_value - Target value
 * @returns {number} response.data.key_results[].current_value - Current value
 * @returns {string} response.data.key_results[].unit - Unit of measurement
 * @returns {number} response.data.key_results[].weight - Weight percentage
 * @returns {string} [response.data.key_results[].due_date] - Due date (nullable)
 * @returns {string} response.data.key_results[].evaluation_method - Evaluation method used
 * @returns {number} response.data.key_results[].progress_percentage - Progress percentage (0-100)
 * @returns {number} response.data.key_results[].objective_id - Associated objective ID
 * 
 * @throws {Error} If creation fails:
 *   - 400: Invalid objective ID or no key results provided
 *   - 403: No permission to edit this objective
 *   - 404: Objective not found
 *   - 422: Validation error (total weight exceeds 100, invalid field values, or other constraints)
 * 
 * @description Create multiple key results for an objective in a single batch operation.
 * This is more efficient than creating key results individually when adding multiple items.
 * Note: Total weight of all key results should not exceed 100%.
 * 
 * @example
 * const newKRs = await createBatchKeyResults(1, {
 *   key_results: [
 *     {
 *       title: 'Increase user engagement to 100 DAU',
 *       target_value: 100,
 *       current_value: 0,
 *       unit: 'users',
 *       weight: 40,
 *       due_date: '2026-06-30',
 *       evaluation_method: 'MAXIMIZE'
 *     },
 *     {
 *       title: 'Reduce bounce rate to 20%',
 *       target_value: 20,
 *       current_value: 45,
 *       unit: '%',
 *       weight: 35,
 *       due_date: '2026-06-30',
 *       evaluation_method: 'MINIMIZE'
 *     },
 *     {
 *       title: 'Achieve 95% uptime',
 *       target_value: 95,
 *       unit: '%',
 *       weight: 25,
 *       evaluation_method: 'TARGET'
 *     }
 *   ]
 * });
 */
export const createBatchKeyResults = async (objective_id, data) => {
  const response = await axiosClient.post(
    `/objectives/${objective_id}/key-results/batch`,
    data
  );
  return response.data;
};

/**
 * Update a key result
 * @async
 * @function updateKeyResult
 * @param {number} id - Key result ID (required)
 * @param {Object} data - Update data (at least one field required)
 * @param {string} [data.title] - Key result title (optional, 1-255 characters)
 * @param {number} [data.target_value] - Target value to achieve (optional, must be > 0)
 * @param {number} [data.current_value] - Current value progress (optional, must be >= 0)
 * @param {string} [data.unit] - Unit of measurement (optional, 1-50 characters)
 * @param {number} [data.weight] - Weight percentage (optional, 0-100)
 * @param {string} [data.due_date] - Due date in YYYY-MM-DD format (optional, nullable)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "Key result updated successfully")
 * @returns {Object} response.data - Updated key result object
 * @returns {Object} response.data.key_result - Key result details
 * @returns {number} response.data.key_result.id - Key result ID
 * @returns {string} response.data.key_result.title - Updated title
 * @returns {number} response.data.key_result.target_value - Updated target value
 * @returns {number} response.data.key_result.current_value - Updated current value
 * @returns {string} response.data.key_result.unit - Updated unit of measurement
 * @returns {number} response.data.key_result.weight - Updated weight percentage
 * @returns {string} [response.data.key_result.due_date] - Updated due date (nullable)
 * @returns {number} response.data.key_result.progress_percentage - Updated progress percentage
 * 
 * @throws {Error} If update fails:
 *   - 400: Invalid key result ID or no fields provided to update
 *   - 403: No permission to edit this objective
 *   - 404: Key result not found
 *   - 422: Validation error (invalid field values)
 * 
 * @description Update one or more fields of a key result.
 * At least one field must be provided to update.
 * 
 * @example
 * const updated = await updateKeyResult(1, {
 *   current_value: 50,
 *   weight: 75
 * });
 */
export const updateKeyResult = async (id, data) => {
  const response = await axiosClient.put(`/key-results/${id}`, data);
  return response.data;
};

/**
 * Delete a key result
 * @async
 * @function deleteKeyResult
 * @param {number} id - Key result ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "Key result deleted successfully")
 * @returns {Object} [response.data] - Deleted key result object (nullable)
 * 
 * @throws {Error} If deletion fails:
 *   - 400: Invalid key result ID
 *   - 403: No permission to delete this key result
 *   - 404: Key result not found
 * 
 * @description Delete a key result from an objective.
 * This operation typically performs a soft delete (marks as deleted without removing from database).
 * 
 * @example
 * const deleted = await deleteKeyResult(1);
 */
export const deleteKeyResult = async (id) => {
  const response = await axiosClient.delete(`/key-results/${id}`);
  return response.data;
};
