/**
 * @fileoverview OKR Service - Central export point for all OKR-related services
 * 
 * This module serves as a unified entry point for OKR operations by re-exporting
 * functions from specialized service modules:
 * 
 * 1. objective.js - Objective management (CRUD, approval workflow, hierarchy)
 * 2. key-result.js - Key Result management (tracking progress toward objectives)
 * 3. checkIn.js - Check-in management (tracking progress updates for key results)
 * 
 * @example
 * // Import individual functions from specific modules
 * import { getObjectives, createObjective } from './objective';
 * import { getKeyResults, updateKeyResult } from './key-result';
 * import { createCheckIn, getCheckIns } from './checkIn';
 * 
 * // OR import everything from the central export
 * import * as OKRServices from './okr';
 */

// Re-export Objective functions
export {
  getObjectives,
  getAvailableParentObjectives,
  createObjective,
  updateObjective,
  submitObjective,
  approveObjective,
  rejectObjective,
  deleteObjective,
  revertObjectiveToDraft,
  getObjectiveById,
} from './objective.js';

// Re-export Key Result functions
export {
  getKeyResults,
  createKeyResult,
  createBatchKeyResults,
  updateKeyResult,
  deleteKeyResult,
} from './key-result.js';

// Re-export Check-In functions
export {
  createCheckIn,
  getCheckIns,
  getObjectiveCheckIns,
} from './checkIn.js';
