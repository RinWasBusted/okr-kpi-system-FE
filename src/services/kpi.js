// ==================== AGGREGATED EXPORTS ====================
// This file re-exports all KPI-related functions from modularized services
// to maintain backward compatibility with existing imports

// Objective (KPI Assignments) exports
export {
  getKPIAssignments,
  getKPIAssignmentById,
  getAvailableParentKPIs,
  createKPIAssignment,
  updateKPIAssignment,
  deleteKPIAssignment
} from './objective.js';

// Key Result (KPI Dictionaries) exports
export {
  getKPIDictionaries,
  createKPIDictionary,
  updateKPIDictionary,
  deleteKPIDictionary
} from './key-result.js';

// Check-in (KPI Records) exports
export {
  createKPIRecord,
  getKPIRecords,
  getKPIChartData
} from './check-in.js';
