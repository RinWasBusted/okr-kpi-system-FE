import axiosClient from '../utils/axios';

/**
 * Get list of cycles with pagination and filters
 * @async
 * @function getCycles
 * @param {Object} params - Query parameters
 * @param {boolean} [params.is_locked] - Filter: true = only locked cycles, false = only unlocked cycles
 * @param {number} [params.year] - Filter by start year (e.g., 2026)
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.per_page=20] - Records per page (max 100)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of cycle objects
 * @returns {number} response.data[].id - Cycle ID
 * @returns {string} response.data[].name - Cycle name (e.g., "Q2/2026")
 * @returns {string} response.data[].start_date - Start date (format: YYYY-MM-DD)
 * @returns {string} response.data[].end_date - End date (format: YYYY-MM-DD)
 * @returns {boolean} response.data[].is_locked - Whether cycle is locked/read-only
 * @returns {number} response.data[].days_remaining - Days remaining in cycle
 * @returns {Object} response.meta - Pagination metadata
 * @returns {number} response.meta.total - Total number of cycles
 * @returns {number} response.meta.open_cycles_count - Number of unlocked cycles
 * @returns {number} response.meta.page - Current page number
 * @returns {number} response.meta.per_page - Records per page
 * @returns {number} response.meta.last_page - Last page number
 * 
 * @throws {Error} If request fails or user lacks ADMIN_COMPANY role
 * 
 * @example
 * const cycles = await getCycles({ year: 2026, is_locked: false, page: 1, per_page: 20 });
 */
export const getCycles = async (params = {}) => {
    try {
        const response = await axiosClient.get('/cycles', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new cycle
 * @async
 * @function createCycle
 * @param {Object} data - Cycle data
 * @param {string} data.name - Cycle name (e.g., "Q2/2026")
 * @param {string} data.start_date - Start date (format: YYYY-MM-DD, e.g., "2026-04-01")
 * @param {string} data.end_date - End date (format: YYYY-MM-DD, e.g., "2026-06-30")
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether cycle was created successfully
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created cycle object (same structure as getCycles response item)
 * 
 * @throws {Error} If validation fails (DATE_OVERLAP, invalid dates, etc.) or user lacks ADMIN_COMPANY role
 * 
 * @example
 * const newCycle = await createCycle({
 *   name: 'Q2/2026',
 *   start_date: '2026-04-01',
 *   end_date: '2026-06-30'
 * });
 */
export const createCycle = async (data) => {
    try {
        const response = await axiosClient.post('/cycles', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get detailed information of a cycle including statistics
 * @async
 * @function getCycleById
 * @param {number} id - Cycle ID
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Cycle data object
 * @returns {Object} response.data.cycle - Cycle details
 * @returns {number} response.data.cycle.id - Cycle ID
 * @returns {string} response.data.cycle.name - Cycle name
 * @returns {string} response.data.cycle.start_date - Start date (ISO format: YYYY-MM-DDTHH:mm:ss.SSSZ)
 * @returns {string} response.data.cycle.end_date - End date (ISO format: YYYY-MM-DDTHH:mm:ss.SSSZ)
 * @returns {boolean} response.data.cycle.is_locked - Whether cycle is locked/read-only
 * @returns {number} response.data.cycle.days_remaining - Days remaining in cycle
 * @returns {Object} response.data.cycle.statistics - Cycle statistics
 * @returns {number} response.data.cycle.statistics.total_objectives - Total number of objectives in cycle
 * @returns {number} response.data.cycle.statistics.total_kpis - Total number of KPIs in cycle
 * @returns {number} response.data.cycle.statistics.avg_objective_progress - Average progress of all objectives (0-100)
 * @returns {number} response.data.cycle.statistics.avg_kpi_progress - Average progress of all KPIs (0-100)
 * 
 * @throws {Error} If cycle not found (404) or request fails
 * 
 * @example
 * const cycleDetail = await getCycleById(1);
 * console.log(cycleDetail.data.cycle.statistics.avg_objective_progress);
 */
export const getCycleById = async (id) => {
    try {
        const response = await axiosClient.get(`/cycles/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update a cycle (only when cycle is not locked)
 * @async
 * @function updateCycle
 * @param {number} id - Cycle ID
 * @param {Object} data - Cycle data to update
 * @param {string} [data.name] - Cycle name
 * @param {string} [data.start_date] - Start date (format: YYYY-MM-DD)
 * @param {string} [data.end_date] - End date (format: YYYY-MM-DD)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether cycle was updated successfully
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated cycle object
 * 
 * @throws {Error} If cycle is locked, not found, validation fails, or user lacks ADMIN_COMPANY role
 * 
 * @example
 * const updated = await updateCycle(1, { name: 'Q2/2026 Updated' });
 */
export const updateCycle = async (id, data) => {
    try {
        const response = await axiosClient.put(`/cycles/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Lock a cycle to make it read-only
 * @async
 * @function lockCycle
 * @param {number} id - Cycle ID to lock
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether cycle was locked successfully
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated cycle object with is_locked: true
 * 
 * @throws {Error} If cycle not found, already locked, or user lacks ADMIN_COMPANY role
 * 
 * @example
 * const locked = await lockCycle(1);
 * console.log(locked.data.is_locked); // true
 */
export const lockCycle = async (id) => {
    try {
        const response = await axiosClient.patch(`/cycles/${id}/lock`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Unlock a cycle to allow modifications
 * @async
 * @function unlockCycle
 * @param {number} id - Cycle ID to unlock
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether cycle was unlocked successfully
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated cycle object with is_locked: false
 * 
 * @throws {Error} If cycle not found, already unlocked, or user lacks ADMIN_COMPANY role
 * 
 * @example
 * const unlocked = await unlockCycle(1);
 * console.log(unlocked.data.is_locked); // false
 */
export const unlockCycle = async (id) => {
    try {
        const response = await axiosClient.patch(`/cycles/${id}/unlock`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Clone a cycle into a brand new cycle with the same info and structure
 * @async
 * @function cloneCycle
 * @param {number} id - Cycle ID to clone
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether cycle was cloned successfully
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Newly created cloned cycle object
 * @returns {number} response.data.id - New cycle ID (different from original)
 * @returns {string} response.data.name - Same name as original cycle
 * @returns {string} response.data.start_date - Same start date as original cycle
 * @returns {string} response.data.end_date - Same end date as original cycle
 * @returns {boolean} response.data.is_locked - Clone is unlocked (false)
 * 
 * @throws {Error} If cycle not found or user lacks ADMIN_COMPANY role
 * 
 * @example
 * const cloned = await cloneCycle(1);
 * console.log(cloned.data.id); // New cycle ID
 * console.log(cloned.data.name); // Same as original
 */
export const cloneCycle = async (id) => {
    try {
        const response = await axiosClient.post(`/cycles/${id}/clone`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete a cycle
 * @async
 * @function deleteCycle
 * @param {number} id - Cycle ID to delete
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether cycle was deleted successfully
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Deleted cycle ID
 * @returns {number} response.data.id - The ID of deleted cycle
 * 
 * @throws {Error} If cycle not found or user lacks ADMIN_COMPANY role
 * 
 * @example
 * const deleted = await deleteCycle(1);
 * console.log(deleted.data.id); // Deleted cycle ID
 */
export const deleteCycle = async (id) => {
    try {
        const response = await axiosClient.delete(`/cycles/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
