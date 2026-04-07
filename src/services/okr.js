import axiosClient from '../utils/axios.js';

// ==================== OBJECTIVES ====================

/**
 * Get list of objectives with visibility hierarchy enforcement
 * @async
 * @function getObjectives
 * @param {Object} params - Query parameters
 * @param {number} [params.cycle_id] - Filter by cycle ID
 * @param {number} [params.unit_id] - Filter by unit ID
 * @param {number} [params.owner_id] - Filter by owner user ID
 * @param {string} [params.status] - Filter by status (Draft, Active, Pending_Approval, Rejected, Completed)
 * @param {string} [params.progress_status] - Filter by progress status (NOT_STARTED, DANGER, WARNING, ON_TRACK, COMPLETED)
 * @param {string} [params.visibility] - Filter by visibility (PUBLIC, INTERNAL, PRIVATE)
 * @param {number} [params.parent_objective_id] - Filter by parent objective ID
 * @param {boolean} [params.include_key_results] - Include associated key results in response (default: false)
 * @param {string} [params.mode] - Response format: 'tree' (hierarchical) or 'list' (flat) (default: tree)
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.per_page=20] - Records per page (max 100)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of objective objects
 * @returns {number} response.data[].id - Objective ID
 * @returns {string} response.data[].title - Objective title
 * @returns {string} [response.data[].description] - Objective description (nullable)
 * @returns {string} response.data[].status - Status (Draft, Active, Pending_Approval, Rejected, Completed)
 * @returns {string} response.data[].visibility - Visibility level (PUBLIC < INTERNAL < PRIVATE)
 * @returns {number} response.data[].progress_percentage - Progress percentage (0-100)
 * @returns {string} response.data[].progress_status - Progress status (NOT_STARTED, DANGER, WARNING, ON_TRACK, COMPLETED)
 * @returns {Object} [response.data[].cycle] - Associated cycle object (nullable)
 * @returns {number} [response.data[].cycle.id] - Cycle ID
 * @returns {string} [response.data[].cycle.name] - Cycle name
 * @returns {string} [response.data[].cycle.start_date] - Cycle start date (format: date)
 * @returns {string} [response.data[].cycle.end_date] - Cycle end date (format: date)
 * @returns {Object} [response.data[].owner] - Owner user object (nullable)
 * @returns {Object} [response.data[].unit] - Associated unit object (nullable)
 * @returns {Object} [response.data[].parent_objective] - Parent objective object (nullable)
 * @returns {Object} response.meta - Pagination metadata
 * @returns {number} response.meta.total - Total number of objectives
 * @returns {number} response.meta.page - Current page number
 * @returns {number} response.meta.per_page - Records per page
 * @returns {number} response.meta.last_page - Last page number
 * 
 * @throws {Error} If request fails or query parameters are invalid
 * 
 * @description Retrieve objectives with visibility hierarchy enforcement.
 * Child objectives cannot be more public than parent objectives (PUBLIC < INTERNAL < PRIVATE).
 * 
 * @example
 * const objectives = await getObjectives({ 
 *   cycle_id: 1, 
 *   status: 'Active', 
 *   mode: 'tree',
 *   page: 1,
 *   per_page: 20
 * });
 */
export const getObjectives = async (params = {}) => {
  const response = await axiosClient.get('/objectives', { params });
  return response.data;
};

/**
 * Get available parent objectives for a unit
 * @async
 * @function getAvailableParentObjectives
 * @param {Object} params - Query parameters
 * @param {number} params.unit_id - The unit ID for which to find available parent objectives (required)
 * @param {number} [params.cycle_id] - Optional filter by cycle
 * @param {boolean} [params.include_key_results] - Include associated key results in response (default: false)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of grouped objectives by unit
 * @returns {Object} [response.data[].unit] - Unit object (nullable)
 * @returns {Array<Object>} response.data[].objectives - Array of objectives in this unit
 * @returns {number} response.data[].objectives[].id - Objective ID
 * @returns {string} response.data[].objectives[].title - Objective title
 * @returns {string} response.data[].objectives[].status - Status (Active or Completed)
 * @returns {string} response.data[].objectives[].visibility - Visibility level
 * @returns {number} response.data[].objectives[].progress_percentage - Progress percentage
 * @returns {Object} response.meta - Metadata
 * @returns {number} response.meta.unit_id - The requested unit ID
 * @returns {Array<number>} response.meta.unit_ids_searched - All unit IDs searched (specified unit + ancestors)
 * @returns {number} response.meta.total - Total number of available parent objectives
 * 
 * @throws {Error} If request fails
 *   - 400: Invalid unit_id
 *   - 404: Unit not found
 * 
 * @description Retrieve objectives that can be set as parent for a new objective in the specified unit.
 * Returns objectives from the specified unit and all its ancestor units.
 * Only includes objectives with status "Active" or "Completed".
 * Results are filtered by visibility permissions.
 * 
 * @example
 * const availableParents = await getAvailableParentObjectives({
 *   unit_id: 5,
 *   cycle_id: 1,
 *   include_key_results: false
 * });
 */
export const getAvailableParentObjectives = async (params = {}) => {
  const response = await axiosClient.get('/objectives/available-parents', { params });
  return response.data;
};

/**
 * Create a new objective with visibility hierarchy enforcement
 * @async
 * @function createObjective
 * @param {Object} data - Objective data
 * @param {string} data.title - Objective title (required, 1-255 characters)
 * @param {number} data.cycle_id - Cycle ID this objective belongs to (required)
 * @param {number} [data.unit_id] - Target unit ID (optional)
 * @param {number} [data.owner_id] - Assign to specific user ID (optional)
 * @param {number} [data.parent_objective_id] - Parent objective ID for hierarchy (optional, child visibility must be >= parent visibility)
 * @param {string} [data.visibility] - Visibility level (default: INTERNAL)
 *   - PUBLIC: Visible to all users
 *   - INTERNAL: Visible within unit hierarchy
 *   - PRIVATE: Only visible to owner and unit ancestors
 *   Note: If parent_objective_id provided, child visibility must be >= parent visibility (more private or equal)
 *   Numeric values: PUBLIC (1) < INTERNAL (2) < PRIVATE (3)
 * @param {string} [data.description] - Objective description (optional, max 1000 characters)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created objective object
 * @returns {number} response.data.id - Objective ID
 * @returns {string} response.data.title - Objective title
 * @returns {string} [response.data.description] - Objective description
 * @returns {string} response.data.status - Status (automatically determined based on user role and target unit)
 * @returns {string} response.data.visibility - Visibility level
 * @returns {number} response.data.progress_percentage - Initial progress percentage (0)
 * @returns {number} response.data.cycle_id - Cycle ID
 * @returns {number} [response.data.unit_id] - Unit ID (if assigned to unit)
 * @returns {number} [response.data.owner_id] - Owner user ID (if assigned)
 * @returns {number} [response.data.parent_objective_id] - Parent objective ID (if has parent)
 * 
 * @throws {Error} If validation fails:
 *   - 400: Objective cannot be its own parent
 *   - 422: Child visibility more public than parent (visibility hierarchy violation)
 * 
 * @description Status is determined automatically based on user role and target unit.
 * Child visibility must be >= parent visibility (more private or equal).
 * 
 * @example
 * const newObjective = await createObjective({
 *   title: 'Increase customer satisfaction',
 *   description: 'Improve customer satisfaction score to 95%',
 *   cycle_id: 1,
 *   unit_id: 5,
 *   visibility: 'INTERNAL'
 * });
 */
export const createObjective = async (data) => {
  const response = await axiosClient.post('/objectives', data);
  return response.data;
};

/**
 * Update an objective with visibility hierarchy enforcement
 * @async
 * @function updateObjective
 * @param {number} id - Objective ID (required)
 * @param {Object} data - Update data
 * @param {string} [data.title] - Objective title (1-255 characters)
 * @param {number} [data.parent_objective_id] - Change parent objective ID (nullable, child visibility must be >= parent visibility)
 * @param {string} [data.visibility] - Visibility level (PUBLIC, INTERNAL, PRIVATE)
 *   - PUBLIC (1) < INTERNAL (2) < PRIVATE (3)
 *   Note: Must be >= parent visibility if parent changes (more private or equal)
 * @param {string} [data.description] - Objective description (max 1000 characters)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated objective object
 * @returns {number} response.data.id - Objective ID
 * @returns {string} response.data.title - Updated title
 * @returns {string} [response.data.description] - Updated description
 * @returns {string} response.data.status - Status (unchanged for Active objectives)
 * @returns {string} response.data.visibility - Updated visibility
 * @returns {number} [response.data.parent_objective_id] - Updated parent objective ID
 * 
 * @throws {Error} If operation fails:
 *   - 400: Invalid objective ID or objective cannot be its own parent
 *   - 403: No permission to update
 *   - 422: Validation error (e.g., child visibility more public than parent)
 * 
 * @description Allowed when objective status is Draft, Rejected, or Active.
 * For Active objectives, title/parent/visibility can change without resetting to Draft (supports iteration after feedback).
 * Child visibility must be >= parent visibility (more private or equal).
 * 
 * @example
 * const updated = await updateObjective(1, {
 *   title: 'Updated title',
 *   description: 'Updated description',
 *   visibility: 'PRIVATE'
 * });
 */
export const updateObjective = async (id, data) => {
  const response = await axiosClient.put(`/objectives/${id}`, data);
  return response.data;
};

/**
 * Submit objective for approval
 * @async
 * @function submitObjective
 * @param {number} id - Objective ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated objective object with status = Pending_Approval
 * @returns {string} response.data.status - Updated status (Pending_Approval)
 * 
 * @throws {Error} If submission fails
 * 
 * @description Changes objective status from Draft or Rejected to Pending_Approval for review by approvers.
 * 
 * @example
 * const submitted = await submitObjective(1);
 */
export const submitObjective = async (id) => {
  const response = await axiosClient.post(`/objectives/${id}/submit`);
  return response.data;
};

/**
 * Approve objective with optional updates
 * @async
 * @function approveObjective
 * @param {number} id - Objective ID (required)
 * @param {Object} [data] - Optional approval data with updates
 * @param {string} [data.title] - Update objective title (1-255 characters)
 * @param {number} [data.parent_objective_id] - Set parent objective ID (nullable, child visibility must be >= parent visibility)
 * @param {string} [data.visibility] - Set visibility level (PUBLIC, INTERNAL, PRIVATE)
 *   - PUBLIC (1) < INTERNAL (2) < PRIVATE (3)
 *   Note: Must be >= parent visibility if parent is set (more private or equal)
 * @param {string} [data.description] - Update objective description (max 1000 characters)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Approved objective object
 * @returns {number} response.data.id - Objective ID
 * @returns {string} response.data.status - Updated status (Active)
 * @returns {string} response.data.title - Title (updated if provided)
 * @returns {string} [response.data.description] - Description (updated if provided)
 * @returns {string} response.data.visibility - Visibility (updated if provided)
 * @returns {number} [response.data.parent_objective_id] - Parent objective ID (updated if provided)
 * 
 * @throws {Error} If approval fails:
 *   - 400: Objective not pending approval or invalid parent
 *   - 403: No permission to approve
 *   - 422: Validation error (e.g., child visibility more public than parent)
 * 
 * @description Objective status must be Pending_Approval.
 * Can optionally update title, parent, visibility, or description during approval process.
 * Child visibility must be >= parent visibility if parent changes (more private or equal).
 * 
 * @example
 * const approved = await approveObjective(1, {
 *   title: 'Final approved title',
 *   description: 'Final description after review',
 *   visibility: 'INTERNAL'
 * });
 */
export const approveObjective = async (id, data = {}) => {
  const response = await axiosClient.post(`/objectives/${id}/approve`, data);
  return response.data;
};

/**
 * Reject objective with optional reason
 * @async
 * @function rejectObjective
 * @param {number} id - Objective ID (required)
 * @param {Object} [data] - Rejection data
 * @param {string} [data.comment] - Reason for rejection (max 1000 characters)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Rejected objective object
 * @returns {string} response.data.status - Updated status (Rejected)
 * @returns {string} [response.data.rejection_comment] - Rejection reason if provided
 * 
 * @throws {Error} If rejection fails
 * 
 * @description Changes objective status from Pending_Approval to Rejected.
 * Objective can be resubmitted after rejection.
 * 
 * @example
 * const rejected = await rejectObjective(1, {
 *   comment: 'Target too ambitious for Q1'
 * });
 */
export const rejectObjective = async (id, data = {}) => {
  const response = await axiosClient.post(`/objectives/${id}/reject`, data);
  return response.data;
};

/**
 * Delete objective (soft delete)
 * @async
 * @function deleteObjective
 * @param {number} id - Objective ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Deleted objective object (marked as deleted)
 * 
 * @throws {Error} If deletion fails or objective not found
 * 
 * @description Performs a soft delete (marks as deleted without removing from database).
 * Deleted objectives are hidden from normal queries but can be recovered if needed.
 * 
 * @example
 * const deleted = await deleteObjective(1);
 */
export const deleteObjective = async (id) => {
  const response = await axiosClient.delete(`/objectives/${id}`);
  return response.data;
};

/**
 * Revert objective to draft status
 * @async
 * @function revertObjectiveToDraft
 * @param {number} id - Objective ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Reverted objective object
 * @returns {Object} response.data.objective - Objective details
 * @returns {number} response.data.objective.id - Objective ID
 * @returns {string} response.data.objective.title - Objective title
 * @returns {string} [response.data.objective.description] - Objective description
 * @returns {string} response.data.objective.status - Updated status (Draft)
 * @returns {string} response.data.objective.visibility - Visibility level
 * @returns {number} response.data.objective.progress_percentage - Progress percentage
 * @returns {string} response.data.objective.progress_status - Progress status
 * 
 * @throws {Error} If revert fails:
 *   - 400: Invalid objective ID or cannot revert from current status
 *   - 403: No permission to revert this objective (only owner, unit manager, or company admin can revert)
 *   - 404: Objective not found
 * 
 * @description Revert an objective from Rejected, Pending_Approval, Active, or Completed status back to Draft.
 * Only the objective owner, unit manager, or company admin can perform this action.
 * After reverting to Draft, the objective can be edited and resubmitted for approval.
 * 
 * @example
 * const reverted = await revertObjectiveToDraft(1);
 */
export const revertObjectiveToDraft = async (id) => {
  const response = await axiosClient.post(`/objectives/${id}/revert-to-draft`);
  return response.data;
};

/**
 * Get objective details by ID
 * @async
 * @function getObjectiveById
 * @param {number} id - Objective ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Objective data wrapper
 * @returns {Object} response.data.objective - Objective detail object
 * @returns {number} response.data.objective.id - Objective ID
 * @returns {string} response.data.objective.title - Objective title
 * @returns {string} [response.data.objective.description] - Objective description (nullable)
 * @returns {string} response.data.objective.status - Status (Draft, Active, Pending_Approval, Rejected, Completed)
 * @returns {string} response.data.objective.visibility - Visibility level (PUBLIC, INTERNAL, PRIVATE)
 * @returns {number} response.data.objective.progress_percentage - Progress percentage (0-100)
 * @returns {string} response.data.objective.progress_status - Progress status (NOT_STARTED, DANGER, WARNING, ON_TRACK, COMPLETED)
 * @returns {Object} [response.data.objective.cycle] - Associated cycle object (nullable)
 * @returns {number} [response.data.objective.cycle.id] - Cycle ID
 * @returns {string} [response.data.objective.cycle.name] - Cycle name
 * @returns {string} [response.data.objective.cycle.start_date] - Cycle start date (YYYY-MM-DD)
 * @returns {string} [response.data.objective.cycle.end_date] - Cycle end date (YYYY-MM-DD)
 * @returns {Object} [response.data.objective.owner] - Owner user object (nullable)
 * @returns {number} [response.data.objective.owner.id] - User ID
 * @returns {string} [response.data.objective.owner.full_name] - User full name
 * @returns {string} [response.data.objective.owner.email] - User email
 * @returns {Object} [response.data.objective.unit] - Associated unit object (nullable)
 * @returns {number} [response.data.objective.unit.id] - Unit ID
 * @returns {string} [response.data.objective.unit.name] - Unit name
 * @returns {Object} [response.data.objective.parent_objective] - Parent objective object (nullable)
 * @returns {number} [response.data.objective.parent_objective.id] - Parent objective ID
 * @returns {string} [response.data.objective.parent_objective.title] - Parent objective title
 * @returns {Array<Object>} [response.data.objective.key_results] - Associated key results array (nullable)
 * @returns {number} [response.data.objective.key_results[].id] - Key result ID
 * @returns {string} [response.data.objective.key_results[].title] - Key result title
 * @returns {number} [response.data.objective.key_results[].target_value] - Target value
 * @returns {number} [response.data.objective.key_results[].current_value] - Current value
 * @returns {string} [response.data.objective.key_results[].unit] - Unit of measurement
 * @returns {number} [response.data.objective.key_results[].progress_percentage] - Progress percentage (0-100)
 * 
 * @throws {Error} If request fails:
 *   - 400: Invalid objective ID
 *   - 403: No permission to view this objective (visibility rules)
 *   - 404: Objective not found
 * 
 * @description Retrieve a single objective with its key results.
 * User must have permission to view the objective based on visibility rules (PUBLIC < INTERNAL < PRIVATE).
 * Response includes associated cycle, owner, unit, parent objective, and key results.
 * 
 * @example
 * const objective = await getObjectiveById(1);
 * // Returns: {
 * //   success: true,
 * //   message: 'Objective retrieved successfully',
 * //   data: {
 * //     objective: {
 * //       id: 1,
 * //       title: 'Increase customer satisfaction',
 * //       description: 'Improve satisfaction score to 95%',
 * //       status: 'Active',
 * //       visibility: 'INTERNAL',
 * //       progress_percentage: 75,
 * //       progress_status: 'ON_TRACK',
 * //       cycle: { id: 1, name: 'Q1 2026', start_date: '2026-01-01', end_date: '2026-03-31' },
 * //       owner: { id: 1, full_name: 'John Doe', email: 'john@example.com' },
 * //       unit: { id: 5, name: 'Engineering' },
 * //       parent_objective: null,
 * //       key_results: [...]
 * //     }
 * //   }
 * // }
 */
export const getObjectiveById = async (id) => {
  const response = await axiosClient.get(`/objectives/${id}`);
  return response.data;
};

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

// ==================== OKR ASSIGNMENTS ====================

/**
 * Get list of OKR Assignments
 * @async
 * @function getOKRAssignments
 * @param {Object} params - Query parameters
 * @param {number} [params.cycle_id] - Filter by cycle ID
 * @param {number} [params.unit_id] - Filter by unit ID
 * @param {number} [params.owner_id] - Filter by owner user ID
 * @param {string} [params.visibility] - Filter by visibility (PUBLIC, INTERNAL, PRIVATE)
 * @param {number} [params.parent_assignment_id] - Filter by parent assignment ID
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.per_page=20] - Records per page (default 20, max 100)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of OKR assignment objects
 * @returns {number} response.data[].id - Assignment ID
 * @returns {number} response.data[].cycle_id - Associated cycle ID
 * @returns {number} response.data[].owner_id - Owner user ID (for personal OKR)
 * @returns {number} [response.data[].unit_id] - Associated unit ID (for unit OKR)
 * @returns {number} response.data[].target_value - Target value
 * @returns {number} response.data[].current_value - Current value
 * @returns {string} response.data[].visibility - Visibility level
 * @returns {Object} response.meta - Pagination metadata
 * @returns {number} response.meta.total - Total number of assignments
 * @returns {number} response.meta.page - Current page number
 * @returns {number} response.meta.per_page - Records per page
 * @returns {number} response.meta.last_page - Last page number
 * 
 * @throws {Error} If request fails
 * 
 * @example
 * const assignments = await getOKRAssignments({ 
 *   cycle_id: 1, 
 *   unit_id: 5,
 *   page: 1,
 *   per_page: 20
 * });
 */
export const getOKRAssignments = async (params = {}) => {
  const response = await axiosClient.get('/okr-assignments', { params });
  return response.data;
};

/**
 * Create a new OKR Assignment
 * @async
 * @function createOKRAssignment
 * @param {Object} data - OKR Assignment data
 * @param {number} data.okr_dictionary_id - OKR Dictionary ID (required)
 * @param {number} data.cycle_id - Cycle ID (required)
 * @param {number} data.target_value - Target value (required)
 * @param {number} [data.current_value] - Current value (defaults to 0)
 * @param {number} [data.owner_id] - Owner user ID (for personal OKR)
 * @param {number} [data.unit_id] - Unit ID (for unit OKR)
 * @param {number} [data.parent_assignment_id] - Parent assignment ID (for hierarchy)
 * @param {string} [data.visibility] - Visibility level (default: INTERNAL)
 *   - PUBLIC: Visible to all users
 *   - INTERNAL: Visible within unit hierarchy
 *   - PRIVATE: Only visible to owner and unit ancestors
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created assignment object
 * @returns {number} response.data.id - Assignment ID
 * @returns {number} response.data.okr_dictionary_id - OKR Dictionary ID
 * @returns {number} response.data.cycle_id - Cycle ID
 * @returns {number} response.data.target_value - Target value
 * @returns {number} response.data.current_value - Current value (initially 0 or provided value)
 * @returns {string} response.data.visibility - Visibility level
 * 
 * @throws {Error} If creation fails or validation error
 * 
 * @example
 * const assignment = await createOKRAssignment({
 *   okr_dictionary_id: 10,
 *   cycle_id: 1,
 *   target_value: 100,
 *   unit_id: 5,
 *   visibility: 'INTERNAL'
 * });
 */
export const createOKRAssignment = async (data) => {
  const response = await axiosClient.post('/okr-assignments', data);
  return response.data;
};

/**
 * Update an OKR Assignment
 * @async
 * @function updateOKRAssignment
 * @param {number} id - OKR Assignment ID (required)
 * @param {Object} data - Update data
 * @param {number} [data.cycle_id] - Cycle ID
 * @param {number} [data.target_value] - Target value
 * @param {number} [data.current_value] - Current value (can be updated to track progress)
 * @param {string} [data.visibility] - Visibility level (PUBLIC, INTERNAL, PRIVATE)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated assignment object
 * @returns {number} response.data.id - Assignment ID
 * @returns {number} response.data.target_value - Updated target value
 * @returns {number} response.data.current_value - Updated current value
 * @returns {string} response.data.visibility - Updated visibility
 * 
 * @throws {Error} If update fails or assignment not found
 * 
 * @example
 * const updated = await updateOKRAssignment(1, {
 *   target_value: 150,
 *   current_value: 75
 * });
 */
export const updateOKRAssignment = async (id, data) => {
  const response = await axiosClient.put(`/okr-assignments/${id}`, data);
  return response.data;
};

/**
 * Get OKR Assignment details by ID
 * @async
 * @function getOKRAssignmentDetail
 * @param {number} id - OKR Assignment ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - OKR Assignment details
 * @returns {number} response.data.id - Assignment ID
 * @returns {number} response.data.okr_dictionary_id - OKR Dictionary ID
 * @returns {number} response.data.cycle_id - Cycle ID
 * @returns {number} response.data.target_value - Target value
 * @returns {number} response.data.current_value - Current value
 * @returns {number} response.data.progress_percentage - Progress percentage (current/target * 100)
 * @returns {string} response.data.visibility - Visibility level
 * @returns {Object} [response.data.okr_dictionary] - Associated OKR Dictionary
 * @returns {Object} [response.data.cycle] - Associated Cycle
 * 
 * @throws {Error} If assignment not found
 * 
 * @example
 * const detail = await getOKRAssignmentDetail(1);
 */
export const getOKRAssignmentDetail = async (id) => {
  const response = await axiosClient.get(`/okr-assignments/${id}`);
  return response.data;
};

/**
 * Delete an OKR Assignment
 * @async
 * @function deleteOKRAssignment
 * @param {number} id - OKR Assignment ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Deleted assignment object (marked as deleted)
 * 
 * @throws {Error} If deletion fails or assignment not found
 * 
 * @description Performs a soft delete (marks as deleted without removing from database).
 * 
 * @example
 * const deleted = await deleteOKRAssignment(1);
 */
export const deleteOKRAssignment = async (id) => {
  const response = await axiosClient.delete(`/okr-assignments/${id}`);
  return response.data;
};
