import axiosClient from '../utils/axios.js';

// ==================== KPI Dictionaries ====================

/**
 * Get list of KPI Dictionaries
 * @async
 * @function getKPIDictionaries
 * @param {Object} [params] - Query parameters (optional)
 * @param {number} [params.for_unit_id] - Filter KPI dictionaries accessible to a specific unit (optional)
 *   Returns: company-wide KPIs + unit's own KPIs + KPIs from ancestor units
 * 
 * @returns {Promise<Object>} Response object (HTTP 200 OK)
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of KPI dictionary objects
 * @returns {number} response.data[].id - KPI Dictionary ID
 * @returns {string} response.data[].name - KPI name (1-255 characters)
 * @returns {string} response.data[].unit - Unit of measurement (e.g., 'VNĐ', '%', 'Số lượng')
 * @returns {string} response.data[].evaluation_method - Evaluation method (Positive, Negative, Stabilizing)
 * @returns {string} [response.data[].description] - KPI description (max 1000 characters, nullable)
 * @returns {number} [response.data[].unit_id] - Unit ID if KPI is unit-specific, null if company-wide (nullable)
 * 
 * @throws {Error} If request fails
 * 
 * @description Retrieve all KPI dictionaries accessible in the system (HTTP 200).
 * If for_unit_id is provided, returns KPIs accessible to that unit including company-wide, unit's own, and ancestor units' KPIs.
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
 * @returns {Promise<Object>} Response object (HTTP 201 Created)
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
 * 
 * @throws {Error} If creation fails:
 *   - 403: Only admin can create KPI dictionaries
 *   - 422: Validation error (invalid field values or validation constraints)
 * 
 * @description Create a new KPI dictionary template that can be assigned to cycles.
 * Only admin role can create KPI dictionaries.
 * Returns HTTP 201 Created on success.
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
 * @param {Object} data - Update data (all fields optional)
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
 * @returns {Promise<Object>} Response object (HTTP 200 OK)
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
 * 
 * @throws {Error} If update fails:
 *   - 403: Only admin can update KPI dictionaries
 *   - 404: KPI Dictionary not found
 *   - 422: Validation error (invalid field values)
 * 
 * @description Update one or more fields of a KPI dictionary.
 * Only admin role can update KPI dictionaries.
 * All fields are optional for partial updates.
 * Returns HTTP 200 OK on success.
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
 * @returns {Promise<void>} No content response (HTTP 204 No Content)
 * 
 * @throws {Error} If deletion fails:
 *   - 400: Cannot delete if KPI assignments exist for this dictionary
 *   - 403: Only admin can delete KPI dictionaries
 *   - 404: KPI Dictionary not found
 * 
 * @description Delete a KPI dictionary.
 * Only admin role can delete KPI dictionaries.
 * Cannot delete if there are existing KPI assignments using this dictionary.
 * Returns HTTP 204 No Content on success (no response body).
 * 
 * @example
 * await deleteKPIDictionary(1);
 */
export const deleteKPIDictionary = async (id) => {
  const response = await axiosClient.delete(`/kpi-dictionaries/${id}`);
  return response.data;
};
