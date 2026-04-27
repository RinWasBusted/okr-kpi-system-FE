import axiosClient from '../utils/axios.js';

/**
 * Get KPI timeline data for chart visualization
 * @param {Object} params - Query parameters
 * @param {number} params.cycle_id - Cycle ID (required)
 * @param {string} [params.group_by] - Aggregation level: 'month' (weekly) or 'year' (monthly)
 * @param {number} [params.unit_id] - Filter by unit ID
 * @param {number} [params.user_id] - Filter by user ID
 */
export const getKPITimeline = async (params = {}) => {
  const response = await axiosClient.get('/statistics/kpi-timeline', { params });
  return response.data;
};

/**
 * Get OKR timeline data for chart visualization
 * @param {Object} params - Query parameters
 * @param {number} params.cycle_id - Cycle ID (required)
 * @param {string} [params.group_by] - Aggregation level: 'month' (weekly) or 'year' (monthly)
 * @param {number} [params.unit_id] - Filter by unit ID
 * @param {number} [params.user_id] - Filter by user ID
 */
export const getOKRTimeline = async (params = {}) => {
  const response = await axiosClient.get('/statistics/okr-timeline', { params });
  return response.data;
};

/**
 * Get unit evaluations for a specific cycle
 * @param {number} unitId - Unit ID
 * @param {number} cycleId - Cycle ID
 */
export const getUnitEvaluations = async (unitId, cycleId) => {
  const response = await axiosClient.get(`/units/${unitId}/evaluations`, {
    params: { cycle_id: cycleId },
  });
  return response.data;
};
