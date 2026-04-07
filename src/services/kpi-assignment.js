import axiosClient from '../utils/axios.js';

// ==================== KPI Assignments (Objectives) ====================

/**
 * Get list of KPI Assignments
 * @async
 * @function getKPIAssignments
 * @param {Object} [params] - Query parameters (optional)
 * @param {number} [params.cycle_id] - Filter by cycle ID (optional)
 * @param {number} [params.unit_id] - Filter by unit ID (optional)
 * @param {number} [params.owner_id] - Filter by owner user ID (optional)
 * @param {string} [params.visibility] - Filter by visibility level (optional)
 *   - PUBLIC: Visible to all users
 *   - INTERNAL: Visible within unit hierarchy
 *   - PRIVATE: Only visible to owner and ancestors
 * @param {string} [params.progress_status] - Filter by progress status (optional)
 *   - NOT_STARTED: Progress is 0%
 *   - ON_TRACK: Progress meets expectations
 *   - AT_RISK: Progress behind schedule
 *   - CRITICAL: Progress severely behind
 *   - COMPLETED: Progress is 100%
 * @param {string} [params.kpi_status] - Filter by KPI status from latest record (optional, requires admin/manager)
 *   - ON_TRACK, AT_RISK, CRITICAL
 * @param {string} [params.status] - Filter by activity status (default: 'active', optional)
 *   - active: Active assignments
 *   - deleted: Soft-deleted assignments (requires admin/manager permission)
 * @param {number} [params.parent_assignment_id] - Filter by parent assignment ID (optional)
 * @param {string} [params.mode] - Response format (default: 'tree', optional)
 *   - tree: Hierarchical structure
 *   - list: Flat list
 * @param {number} [params.page=1] - Current page number (default: 1)
 * @param {number} [params.per_page=20] - Records per page (default: 20, max: 100)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of KPI assignment objects
 * @returns {number} response.data[].id - Assignment ID
 * @returns {Object} response.data[].kpi_dictionary - Associated KPI definition
 * @returns {number} response.data[].kpi_dictionary.id - KPI Dictionary ID
 * @returns {string} response.data[].kpi_dictionary.name - KPI name
 * @returns {string} response.data[].kpi_dictionary.unit - Unit of measurement
 * @returns {string} response.data[].kpi_dictionary.evaluation_method - Evaluation method (Positive, Negative, Stabilizing)
 * @returns {number} response.data[].target_value - Target value to achieve
 * @returns {number} response.data[].current_value - Current value progress
 * @returns {number} response.data[].progress_percentage - Progress percentage (0-100)
 * @returns {string} response.data[].progress_status - Calculated progress status (NOT_STARTED, ON_TRACK, AT_RISK, CRITICAL, COMPLETED)
 * @returns {string} response.data[].visibility - Visibility level (PUBLIC, INTERNAL, PRIVATE)
 * @returns {Object} [response.data[].cycle] - Associated cycle (nullable)
 * @returns {number} [response.data[].cycle.id] - Cycle ID
 * @returns {string} [response.data[].cycle.name] - Cycle name
 * @returns {string} [response.data[].cycle.start_date] - Cycle start date (YYYY-MM-DD)
 * @returns {string} [response.data[].cycle.end_date] - Cycle end date (YYYY-MM-DD)
 * @returns {Object} [response.data[].owner] - Owner user object (nullable)
 * @returns {Object} [response.data[].unit] - Associated unit object (nullable)
 * @returns {Object} [response.data[].parent_assignment] - Parent assignment object (nullable)
 * @returns {Object} [response.data[].latest_record] - Latest KPI record (nullable)
 * @returns {Object} response.meta - Pagination metadata
 * @returns {number} response.meta.total - Total number of assignments
 * @returns {number} response.meta.page - Current page number
 * @returns {number} response.meta.per_page - Records per page
 * @returns {number} response.meta.last_page - Last page number
 * 
 * @throws {Error} If request fails
 * 
 * @description Retrieve KPI assignments with cycle context.
 * Child assignments inherit visibility constraints from parent assignments (PUBLIC < INTERNAL < PRIVATE).
 * Results can be filtered by various criteria and returned in hierarchical or flat format.
 * 
 * @example
 * const assignments = await getKPIAssignments({
 *   cycle_id: 1,
 *   unit_id: 5,
 *   visibility: 'INTERNAL',
 *   mode: 'tree',
 *   page: 1,
 *   per_page: 20
 * });
 */
export const getKPIAssignments = async (params = {}) => {
  const response = await axiosClient.get('/kpi-assignments', { params });
  return response.data;
};

/**
 * Get KPI Assignment details by ID
 * @async
 * @function getKPIAssignmentById
 * @param {number} id - KPI Assignment ID (required)
 *
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - KPI assignment data wrapper
 * @returns {Object} response.data.kpi_assignment - KPI assignment object
 * @returns {number} response.data.kpi_assignment.id - Assignment ID
 * @returns {Object} response.data.kpi_assignment.kpi_dictionary - Associated KPI definition
 * @returns {number} response.data.kpi_assignment.kpi_dictionary.id - KPI Dictionary ID
 * @returns {string} response.data.kpi_assignment.kpi_dictionary.name - KPI name
 * @returns {string} response.data.kpi_assignment.kpi_dictionary.unit - Unit of measurement
 * @returns {string} response.data.kpi_assignment.kpi_dictionary.evaluation_method - Evaluation method (Positive, Negative, Stabilizing)
 * @returns {number} response.data.kpi_assignment.target_value - Target value to achieve
 * @returns {number} response.data.kpi_assignment.current_value - Current value progress
 * @returns {number} response.data.kpi_assignment.progress_percentage - Progress percentage (0-100)
 * @returns {string} response.data.kpi_assignment.progress_status - Calculated progress status (NOT_STARTED, ON_TRACK, AT_RISK, CRITICAL, COMPLETED)
 * @returns {string} response.data.kpi_assignment.status - Activity status (active, deleted)
 * @returns {string} response.data.kpi_assignment.visibility - Visibility level (PUBLIC, INTERNAL, PRIVATE)
 * @returns {Object} [response.data.kpi_assignment.owner] - Owner user object (nullable)
 * @returns {Object} [response.data.kpi_assignment.unit] - Unit object (nullable)
 * @returns {Object} [response.data.kpi_assignment.cycle] - Cycle information (nullable)
 * @returns {Object} [response.data.kpi_assignment.parent_assignment] - Parent assignment object (nullable)
 * @returns {Object} [response.data.kpi_assignment.latest_record] - Latest KPI record (nullable)
 *
 * @throws {Error} If request fails:
 *   - 400: Invalid assignment ID
 *   - 403: No permission to view this assignment
 *   - 404: KPI Assignment not found
 *
 * @description Retrieve detailed information about a specific KPI assignment including its dictionary,
 * owner, unit, cycle, and latest record.
 *
 * @example
 * const kpi = await getKPIAssignmentById(1);
 */
export const getKPIAssignmentById = async (id) => {
  const response = await axiosClient.get(`/kpi-assignments/${id}`);
  return response.data;
};

/**
 * Get available parent KPI assignments for a unit
 * @async
 * @function getAvailableParentKPIs
 * @param {Object} [params] - Query parameters (optional)
 * @param {number} params.unit_id - Unit ID to find available parents for (required)
 * @param {number} [params.kpi_dictionary_id] - Filter by KPI dictionary ID (optional)
 *   Only includes parent assignments using the same KPI dictionary if specified
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of unit groups with available parent assignments
 * @returns {Object} [response.data[].unit] - Unit information (nullable)
 * @returns {number} [response.data[].unit.id] - Unit ID
 * @returns {string} [response.data[].unit.name] - Unit name
 * @returns {Array<Object>} response.data[].assignments - Array of available parent assignments from this unit
 * @returns {number} response.data[].assignments[].id - Assignment ID
 * @returns {Object} response.data[].assignments[].kpi_dictionary - KPI definition
 * @returns {number} response.data[].assignments[].kpi_dictionary.id - KPI Dictionary ID
 * @returns {string} response.data[].assignments[].kpi_dictionary.name - KPI name
 * @returns {string} response.data[].assignments[].kpi_dictionary.unit - Unit of measurement
 * @returns {string} response.data[].assignments[].kpi_dictionary.evaluation_method - Evaluation method (Positive, Negative, Stabilizing)
 * @returns {number} response.data[].assignments[].target_value - Target value
 * @returns {number} response.data[].assignments[].current_value - Current value progress
 * @returns {number} response.data[].assignments[].progress_percentage - Progress percentage (0-100)
 * @returns {Object} response.meta - Response metadata
 * @returns {number} response.meta.unit_id - Target unit ID that was searched
 * @returns {Array<number>} response.meta.unit_ids_searched - All unit IDs searched (target + ancestors)
 * @returns {number} [response.meta.kpi_dictionary_id] - KPI dictionary ID filter if provided (nullable)
 * @returns {number} response.meta.total - Total number of available parent assignments
 * 
 * @throws {Error} If request fails:
 *   - 400: Invalid unit_id
 *   - 404: Unit not found
 * 
 * @description Retrieve KPI assignments that can be set as parent for a new KPI in the specified unit.
 * Returns root assignments (without parent) from the specified unit and all its ancestor units.
 * Filtered by visibility permissions and optionally by KPI dictionary.
 * Only includes assignments without a parent (root assignments).
 * 
 * @example
 * const availableParents = await getAvailableParentKPIs({ unit_id: 5 });
 * const filteredParents = await getAvailableParentKPIs({ unit_id: 5, kpi_dictionary_id: 10 });
 * // Returns: {
 * //   data: [
 * //     {
 * //       unit: { id: 5, name: 'Engineering' },
 * //       assignments: [
 * //         { id: 1, kpi_dictionary: {...}, target_value: 100, current_value: 50, progress_percentage: 50 }
 * //       ]
 * //     },
 * //     {
 * //       unit: { id: 1, name: 'Company' },
 * //       assignments: [...]
 * //     }
 * //   ],
 * //   meta: { unit_id: 5, unit_ids_searched: [5, 1], kpi_dictionary_id: null, total: 2 }
 * // }
 */
export const getAvailableParentKPIs = async (params = {}) => {
  const response = await axiosClient.get('/kpi-assignments/available-parents', { params });
  return response.data;
};

/**
 * Create a new KPI Assignment
 * @async
 * @function createKPIAssignment
 * @param {Object} data - KPI Assignment data
 * @param {number} data.kpi_dictionary_id - KPI Dictionary ID (required)
 * @param {number} data.cycle_id - Cycle ID this assignment belongs to (required)
 * @param {number} data.target_value - Target value to achieve (required, must be > 0)
 * @param {number} [data.current_value] - Current value progress (optional, default: 0, must be >= 0)
 * @param {number} [data.owner_id] - Assign to specific user for personal KPI (optional, either owner_id or unit_id, not both)
 * @param {number} [data.unit_id] - Assign to specific unit (optional, either owner_id or unit_id, not both)
 * @param {number} [data.parent_assignment_id] - Parent assignment ID for hierarchy (optional, child visibility must be >= parent visibility)
 * @param {string} [data.visibility] - Visibility level (default: INTERNAL, optional)
 *   - PUBLIC (1): Visible to all users
 *   - INTERNAL (2): Visible within unit hierarchy
 *   - PRIVATE (3): Only visible to owner and ancestors
 *   Note: If parent_assignment_id provided, child visibility must be >= parent visibility (more private or equal)
 *   Numeric values: PUBLIC (1) < INTERNAL (2) < PRIVATE (3)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created KPI assignment object
 * @returns {Object} response.data.kpi_assignment - KPI Assignment details
 * @returns {number} response.data.kpi_assignment.id - Assignment ID
 * @returns {number} response.data.kpi_assignment.kpi_dictionary_id - KPI Dictionary ID
 * @returns {number} response.data.kpi_assignment.cycle_id - Cycle ID
 * @returns {number} response.data.kpi_assignment.target_value - Target value
 * @returns {number} response.data.kpi_assignment.current_value - Current value (initially 0 or provided value)
 * @returns {number} response.data.kpi_assignment.progress_percentage - Progress percentage (0-100)
 * @returns {string} response.data.kpi_assignment.visibility - Visibility level
 * @returns {number} [response.data.kpi_assignment.owner_id] - Owner user ID (if assigned to user)
 * @returns {number} [response.data.kpi_assignment.unit_id] - Unit ID (if assigned to unit)
 * @returns {number} [response.data.kpi_assignment.parent_assignment_id] - Parent assignment ID (if has parent)
 * @returns {string} response.data.kpi_assignment.created_at - Creation timestamp (ISO 8601)
 * 
 * @throws {Error} If creation fails:
 *   - 400: Invalid request (e.g., both owner_id and unit_id provided, or neither provided)
 *   - 403: No permission to create assignment
 *   - 404: Resource not found (KPI dictionary, cycle, user, unit, parent assignment, etc.)
 *   - 422: Validation error (e.g., child visibility more public than parent, target_value <= 0)
 * 
 * @description Create a new KPI assignment with visibility hierarchy enforcement.
 * Either owner_id or unit_id must be provided (not both).
 * Child visibility must be >= parent visibility (more private or equal) if parent is specified.
 * 
 * @example
 * const newAssignment = await createKPIAssignment({
 *   kpi_dictionary_id: 10,
 *   cycle_id: 1,
 *   target_value: 100,
 *   current_value: 0,
 *   unit_id: 5,
 *   visibility: 'INTERNAL'
 * });
 */
export const createKPIAssignment = async (data) => {
  const response = await axiosClient.post('/kpi-assignments', data);
  return response.data;
};

/**
 * Update a KPI Assignment
 * @async
 * @function updateKPIAssignment
 * @param {number} id - KPI Assignment ID (required)
 * @param {Object} data - Update data (at least one field required)
 * @param {number} [data.cycle_id] - Change assignment cycle (optional)
 * @param {number} [data.target_value] - Target value (optional, must be > 0)
 * @param {number} [data.current_value] - Current progress value (optional, must be >= 0)
 * @param {string} [data.visibility] - Visibility level (optional)
 *   - PUBLIC (1): Visible to all users
 *   - INTERNAL (2): Visible within unit hierarchy
 *   - PRIVATE (3): Only visible to owner and ancestors
 *   Note: If parent assignment exists, child visibility must be >= parent visibility (more private or equal)
 *   Numeric values: PUBLIC (1) < INTERNAL (2) < PRIVATE (3)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated KPI assignment object
 * @returns {Object} response.data.kpi_assignment - KPI Assignment details
 * @returns {number} response.data.kpi_assignment.id - Assignment ID
 * @returns {number} response.data.kpi_assignment.kpi_dictionary_id - KPI Dictionary ID
 * @returns {number} response.data.kpi_assignment.cycle_id - Updated cycle ID
 * @returns {number} response.data.kpi_assignment.target_value - Updated target value
 * @returns {number} response.data.kpi_assignment.current_value - Updated current value
 * @returns {number} response.data.kpi_assignment.progress_percentage - Updated progress percentage
 * @returns {string} response.data.kpi_assignment.visibility - Updated visibility
 * @returns {Object} response.data.kpi_assignment.cycle - Cycle context information
 * @returns {string} response.data.kpi_assignment.updated_at - Last update timestamp (ISO 8601)
 * 
 * @throws {Error} If update fails:
 *   - 400: Invalid assignment ID
 *   - 403: No permission to edit assignment
 *   - 404: KPI Assignment not found
 *   - 422: Validation error (e.g., child visibility more public than parent, target_value <= 0)
 * 
 * @description Update KPI assignment values and settings.
 * Cycle context is automatically included in response.
 * Parent assignment ID and visibility inheritance rules are enforced on create/update.
 * 
 * @example
 * const updated = await updateKPIAssignment(1, {
 *   target_value: 150,
 *   current_value: 75,
 *   visibility: 'INTERNAL'
 * });
 */
export const updateKPIAssignment = async (id, data) => {
  const response = await axiosClient.put(`/kpi-assignments/${id}`, data);
  return response.data;
};

/**
 * Delete a KPI Assignment
 * @async
 * @function deleteKPIAssignment
 * @param {number} id - KPI Assignment ID (required)
 * @param {boolean} [cascade=false] - Cascade deletion behavior (optional, default: false)
 *   - true: Soft delete all descendants recursively
 *   - false: Only soft delete direct children (default)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * 
 * @throws {Error} If deletion fails:
 *   - 403: No permission to delete assignment
 *   - 404: KPI Assignment not found
 * 
 * @description Delete a KPI assignment (soft delete - marks as deleted without removing from database).
 * If cascade is true, all descendant assignments are also soft-deleted recursively.
 * If cascade is false, only direct children are soft-deleted.
 * 
 * @example
 * const deleted = await deleteKPIAssignment(1);
 * const deletedWithCascade = await deleteKPIAssignment(1, true);
 */
export const deleteKPIAssignment = async (id, cascade = false) => {
  const response = await axiosClient.delete(`/kpi-assignments/${id}`, {
    params: { cascade }
  });
  return response.data;
};
