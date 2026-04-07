// ==================== AGGREGATED EXPORTS ====================
// This file re-exports all KPI-related functions from modularized services
// to maintain backward compatibility with existing imports

// KPI Assignments (Objectives) exports
export {
  getKPIAssignments,
  getKPIAssignmentById,
  getAvailableParentKPIs,
  createKPIAssignment,
  updateKPIAssignment,
  deleteKPIAssignment
} from './kpi-assignment.js';

// KPI Dictionaries (Key Results) exports
export {
  getKPIDictionaries,
  createKPIDictionary,
  updateKPIDictionary,
  deleteKPIDictionary
} from './kpi-dictionaries.js';

// KPI Records (Check-ins) exports
export {
  createKPIRecord,
  getKPIRecords,
  getKPIChartData
} from './kpi-record.js';
