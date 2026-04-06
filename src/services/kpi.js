import axiosClient from '../utils/axios.js';

// ==================== KPI Assignments ====================

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

// ==================== KPI Dictionaries ====================

/**
 * Get list of KPI Dictionaries
 * @async
 * @function getKPIDictionaries
 * @param {Object} [params] - Query parameters (optional)
 * @param {number} [params.for_unit_id] - Filter KPI dictionaries accessible to a specific unit
 *   Returns: company-wide KPIs + unit's own KPIs + KPIs from ancestor units (optional)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of KPI dictionary objects
 * @returns {number} response.data[].id - KPI Dictionary ID
 * @returns {string} response.data[].name - KPI name
 * @returns {string} response.data[].unit - Unit of measurement (e.g., 'VNĐ', '%', 'Số lượng')
 * @returns {string} response.data[].evaluation_method - Evaluation method
 *   - Positive: Higher values are better
 *   - Negative: Lower values are better
 *   - Stabilizing: Values should remain stable within a range
 * @returns {string} [response.data[].description] - KPI description (nullable)
 * @returns {number} [response.data[].unit_id] - Unit ID if KPI is unit-specific, null if company-wide (nullable)
 * 
 * @throws {Error} If request fails
 * 
 * @description Retrieve all KPI dictionaries accessible in the system.
 * If for_unit_id is provided, returns KPIs accessible to that unit.
 * 
 * @example
 * const dictionaries = await getKPIDictionaries();
 * const unitKPIs = await getKPIDictionaries({ for_unit_id: 5 });
 */
export const getKPIDictionaries = async (params = {}) => {
  const response = await axiosClient.get('/kpi-dictionaries', { params });
  return response.data;
};

/**
 * Create a new KPI Dictionary
 * @async
 * @function createKPIDictionary
 * @param {Object} data - KPI Dictionary data
 * @param {string} data.name - KPI name (required, 1-255 characters)
 * @param {string} data.unit - Unit of measurement (required, 1-50 characters)
 *   Examples: 'VNĐ', '%', 'Số lượng', 'Khách hàng', 'Triệu đồng'
 * @param {string} data.evaluation_method - Evaluation method (required)
 *   - Positive: Higher values are better
 *   - Negative: Lower values are better
 *   - Stabilizing: Values should remain stable within a range
 * @param {string} [data.description] - Optional description for the KPI (max 1000 characters)
 * @param {number} [data.unit_id] - Unit ID (optional, null for company-wide KPI)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created KPI dictionary object
 * @returns {Object} response.data.kpi_dictionary - KPI Dictionary details
 * @returns {number} response.data.kpi_dictionary.id - KPI Dictionary ID
 * @returns {string} response.data.kpi_dictionary.name - KPI name
 * @returns {string} response.data.kpi_dictionary.unit - Unit of measurement
 * @returns {string} response.data.kpi_dictionary.evaluation_method - Evaluation method
 * @returns {string} [response.data.kpi_dictionary.description] - Description (nullable)
 * @returns {number} [response.data.kpi_dictionary.unit_id] - Unit ID (nullable)
 * @returns {string} response.data.kpi_dictionary.created_at - Creation timestamp (ISO 8601)
 * 
 * @throws {Error} If creation fails:
 *   - 403: Only ADMIN_COMPANY can create KPI dictionaries
 *   - 422: Validation error (invalid field values)
 * 
 * @description Create a new KPI dictionary template that can be assigned to cycles.
 * Only ADMIN_COMPANY role can create KPI dictionaries.
 * 
 * @example
 * const newKPI = await createKPIDictionary({
 *   name: 'Customer Retention Rate',
 *   unit: '%',
 *   evaluation_method: 'Positive',
 *   description: 'Percentage of customers retained from previous period',
 *   unit_id: null
 * });
 */
export const createKPIDictionary = async (data) => {
  const response = await axiosClient.post('/kpi-dictionaries', data);
  return response.data;
};

/**
 * Update a KPI Dictionary
 * @async
 * @function updateKPIDictionary
 * @param {number} id - KPI Dictionary ID (required)
 * @param {Object} data - Update data (at least one field required)
 * @param {string} [data.name] - KPI name (optional, 1-255 characters)
 * @param {string} [data.unit] - Unit of measurement (optional, 1-50 characters)
 *   Examples: 'VNĐ', '%', 'Số lượng', 'Khách hàng', 'Triệu đồng'
 * @param {string} [data.evaluation_method] - Evaluation method (optional)
 *   - Positive: Higher values are better
 *   - Negative: Lower values are better
 *   - Stabilizing: Values should remain stable within a range
 * @param {string} [data.description] - KPI description (optional, max 1000 characters, nullable)
 * @param {number} [data.unit_id] - Unit ID (optional, nullable)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated KPI dictionary object
 * @returns {Object} response.data.kpi_dictionary - KPI Dictionary details
 * @returns {number} response.data.kpi_dictionary.id - KPI Dictionary ID
 * @returns {string} response.data.kpi_dictionary.name - Updated name
 * @returns {string} response.data.kpi_dictionary.unit - Updated unit of measurement
 * @returns {string} response.data.kpi_dictionary.evaluation_method - Updated evaluation method
 * @returns {string} [response.data.kpi_dictionary.description] - Updated description (nullable)
 * @returns {number} [response.data.kpi_dictionary.unit_id] - Updated unit ID (nullable)
 * @returns {string} response.data.kpi_dictionary.updated_at - Last update timestamp (ISO 8601)
 * 
 * @throws {Error} If update fails:
 *   - 403: Only ADMIN_COMPANY can update KPI dictionaries
 *   - 404: KPI Dictionary not found
 *   - 422: Validation error (invalid field values)
 * 
 * @description Update one or more fields of a KPI dictionary.
 * Only ADMIN_COMPANY role can update KPI dictionaries.
 * At least one field must be provided.
 * 
 * @example
 * const updated = await updateKPIDictionary(1, {
 *   name: 'Updated Customer Retention Rate',
 *   evaluation_method: 'Positive'
 * });
 */
export const updateKPIDictionary = async (id, data) => {
  const response = await axiosClient.put(`/kpi-dictionaries/${id}`, data);
  return response.data;
};

/**
 * Delete a KPI Dictionary
 * @async
 * @function deleteKPIDictionary
 * @param {number} id - KPI Dictionary ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "KPI Dictionary deleted successfully")
 * 
 * @throws {Error} If deletion fails:
 *   - 400: Cannot delete if KPI assignments exist for this dictionary
 *   - 403: Only ADMIN_COMPANY can delete KPI dictionaries
 *   - 404: KPI Dictionary not found
 * 
 * @description Delete a KPI dictionary.
 * Only ADMIN_COMPANY role can delete KPI dictionaries.
 * Cannot delete if there are existing KPI assignments using this dictionary.
 * 
 * @example
 * const deleted = await deleteKPIDictionary(1);
 */
export const deleteKPIDictionary = async (id) => {
  const response = await axiosClient.delete(`/kpi-dictionaries/${id}`);
  return response.data;
};

// ==================== KPI Records ====================

/**
 * Create a KPI Record
 * @async
 * @function createKPIRecord
 * @param {number} assignmentId - KPI Assignment ID (required)
 * @param {Object} data - KPI Record data
 * @param {string} data.period_start - Period start date (required, format: YYYY-MM-DD)
 * @param {string} data.period_end - Period end date (required, format: YYYY-MM-DD)
 * @param {number} data.actual_value - Actual achieved value (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - KPI record metrics calculated from data
 * @returns {number} response.data.progress_percentage - Progress percentage achieved (2 decimal places)
 * @returns {number} response.data.time_elapsed_percentage - Time elapsed in cycle (2 decimal places)
 * @returns {number} response.data.ratio - Progress to time ratio (2 decimal places)
 *   - Ratio > 1: Ahead of schedule
 *   - Ratio = 1: On track
 *   - Ratio < 1: Behind schedule
 * @returns {string} response.data.status - Status based on performance
 *   - ON_TRACK: Progress is meeting or exceeding expectations
 *   - AT_RISK: Progress is behind but recoverable
 *   - CRITICAL: Progress is severely behind
 * @returns {string} response.data.trend - Performance trend
 *   - Upward: Performance improving
 *   - Downward: Performance declining
 *   - Stable: Performance remains consistent
 * 
 * @throws {Error} If creation fails:
 *   - 400: Invalid request or logic error
 *   - 403: No permission to create records
 *   - 404: Assignment not found
 *   - 422: Validation error (invalid dates, period mismatch, etc.)
 * 
 * @description Create a new KPI record to track actual performance during a specific period.
 * The system automatically calculates progress percentage, time elapsed, ratio, status, and trend.
 * Ratio is calculated as: progress_percentage / time_elapsed_percentage
 * 
 * @example
 * const record = await createKPIRecord(1, {
 *   period_start: '2026-01-01',
 *   period_end: '2026-03-31',
 *   actual_value: 85
 * });
 * // Response: { progress_percentage: 85, time_elapsed_percentage: 33.33, ratio: 2.55, status: 'ON_TRACK', trend: 'Upward' }
 */
export const createKPIRecord = async (assignmentId, data) => {
  const response = await axiosClient.post(`/kpi-assignments/${assignmentId}/records`, data);
  return response.data;
};

/**
 * Get KPI Records history
 * @async
 * @function getKPIRecords
 * @param {number} assignmentId - KPI Assignment ID (required)
 * @param {Object} [params] - Query parameters (optional)
 * @param {number} [params.page=1] - Current page number (optional)
 * @param {number} [params.per_page=20] - Records per page (optional, default: 20)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of KPI record objects
 * @returns {number} response.data[].id - Record ID
 * @returns {number} response.data[].actual_value - Actual achieved value
 * @returns {string} response.data[].period_start - Period start date (YYYY-MM-DD)
 * @returns {string} response.data[].period_end - Period end date (YYYY-MM-DD)
 * @returns {number} response.data[].progress_percentage - Progress percentage (2 decimal places)
 * @returns {string} response.data[].status - Status based on performance
 *   - ON_TRACK: Progress is meeting or exceeding expectations
 *   - AT_RISK: Progress is behind but recoverable
 *   - CRITICAL: Progress is severely behind
 * @returns {string} response.data[].trend - Performance trend
 *   - Upward: Performance improving
 *   - Downward: Performance declining
 *   - Stable: Performance remains consistent
 * @returns {string} response.data[].created_at - Creation timestamp (ISO 8601)
 * 
 * @throws {Error} If request fails:
 *   - 404: Assignment not found
 * 
 * @description Retrieve historical KPI records for a specific assignment.
 * Shows all actual performance data recorded for this assignment over time.
 * 
 * @example
 * const records = await getKPIRecords(1);
 * const paginatedRecords = await getKPIRecords(1, { page: 1, per_page: 20 });
 */
export const getKPIRecords = async (assignmentId, params = {}) => {
  const response = await axiosClient.get(`/kpi-assignments/${assignmentId}/records`, { params });
  return response.data;
};

/**
 * Get KPI chart data for a unit
 * @async
 * @function getKPIChartData
 * @param {Object} params - Query parameters (required)
 * @param {number} params.unit_id - Unit ID to get chart data for (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - KPI chart data object
 * @returns {Object} response.data.unit - Unit information
 * @returns {number} response.data.unit.id - Unit ID
 * @returns {string} response.data.unit.name - Unit name
 * @returns {Array<Object>} response.data.kpis - Array of KPI objects with chart data
 * @returns {number} response.data.kpis[].kpi_id - KPI Dictionary ID
 * @returns {string} response.data.kpis[].kpi_name - KPI name
 * @returns {string} response.data.kpis[].unit - Unit of measurement
 * @returns {string} response.data.kpis[].evaluation_method - Evaluation method (Positive, Negative, Stabilizing)
 * @returns {number} response.data.kpis[].target_value - Target value for this KPI
 * @returns {Array<Object>} response.data.kpis[].records - Array of KPI records for charting
 * @returns {string} response.data.kpis[].records[].period_start - Period start date (YYYY-MM-DD)
 * @returns {string} response.data.kpis[].records[].period_end - Period end date (YYYY-MM-DD)
 * @returns {number} response.data.kpis[].records[].actual_value - Actual achieved value (displayed on chart)
 * @returns {number} response.data.kpis[].records[].progress_percentage - Progress percentage (2 decimal places)
 * @returns {string} response.data.kpis[].records[].status - Status based on performance
 *   - ON_TRACK: Progress is meeting or exceeding expectations
 *   - AT_RISK: Progress is behind but recoverable
 *   - CRITICAL: Progress is severely behind
 * @returns {string} response.data.kpis[].records[].trend - Performance trend
 *   - Upward: Performance improving
 *   - Downward: Performance declining
 *   - Stable: Performance remains consistent
 * 
 * @throws {Error} If request fails:
 *   - 403: No permission to view this unit
 *   - 404: Unit not found
 *   - 422: Validation error (unit_id required)
 * 
 * @description Retrieve KPI chart data for a unit including all cycles and complete history.
 * Returns all KPI assignments for the unit along with their historical records for visualization.
 * 
 * @example
 * const chartData = await getKPIChartData({ unit_id: 5 });
 * // Returns: {
 * //   unit: { id: 5, name: 'Engineering' },
 * //   kpis: [
 * //     {
 * //       kpi_id: 10,
 * //       kpi_name: 'Customer Retention Rate',
 * //       unit: '%',
 * //       evaluation_method: 'Positive',
 * //       target_value: 95,
 * //       records: [
 * //         { period_start: '2026-01-01', period_end: '2026-03-31', actual_value: 92, progress_percentage: 96.84, status: 'ON_TRACK', trend: 'Upward' }
 * //       ]
 * //     }
 * //   ]
 * // }
 */
export const getKPIChartData = async (params = {}) => {
  const response = await axiosClient.get('/kpi-records/chart-data', { params });
  return response.data;
};
