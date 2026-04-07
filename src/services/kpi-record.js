import axiosClient from '../utils/axios.js';

// ==================== KPI Records (Check-ins) ====================

/**
 * Create a KPI Record (Check-in)
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
