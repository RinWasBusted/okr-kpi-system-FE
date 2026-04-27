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
 * Reject objective with reason
 * @async
 * @function rejectObjective
 * @param {number} id - Objective ID (required)
 * @param {Object} [data] - Rejection data
 * @param {string} [data.comment] - Reason for rejection (optional, max 1000 characters)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "Objective rejected successfully")
 * @returns {Object} response.data - Rejected objective object
 * @returns {number} response.data.id - Objective ID
 * @returns {string} response.data.status - Updated status (Rejected)
 * @returns {string} [response.data.rejection_comment] - Rejection reason if provided
 * @returns {string} [response.data.title] - Objective title
 * @returns {string} [response.data.description] - Objective description
 * @returns {string} [response.data.visibility] - Visibility level
 * @returns {number} [response.data.progress_percentage] - Progress percentage
 * @returns {string} [response.data.progress_status] - Progress status
 * 
 * @throws {Error} If rejection fails:
 *   - 400: Objective not pending approval
 *   - 403: No permission to reject this objective
 *   - 404: Objective not found
 * 
 * @description Reject an objective that is in Pending_Approval status.
 * Changes objective status from Pending_Approval to Rejected.
 * Objective can be resubmitted after rejection by reverting to Draft.
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
