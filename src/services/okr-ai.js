import axiosClient from '../utils/axios.js';

// ==================== OKR AI ====================

/**
 * Generate key result suggestions for an objective using AI
 * @async
 * @function generateKeyResultsForObjective
 * @param {number} objectiveId - The objective ID to generate key results for (required, in path)
 * @param {Object} params - Request parameters
 * @param {number} params.count - Number of suggestions to generate (required, min: 1, max: 10)
 * @param {string} params.language - Language for suggestions (required)
 *   - 'vi' - Vietnamese
 *   - 'en' - English
 * @param {Object} [params.constraints] - Optional constraints for generation
 * @param {string} [params.constraints.due_date] - Due date in YYYY-MM-DD format (optional)
 * @param {string} [params.constraints.unit] - Unit of measurement (optional, e.g., '%', 'users', 'revenue')
 * @param {string} [params.constraints.evaluation_method] - Preferred evaluation method (optional)
 *   - 'MAXIMIZE' - Maximize the metric value
 *   - 'MINIMIZE' - Minimize the metric value
 *   - 'TARGET' - Reach a specific target value
 * @param {string} [params.constraints.context] - Additional context to help AI understand requirements (max 1000 chars)
 *   - e.g., "This is for a fintech startup focusing on mobile payments. Team has 3 engineers."
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message (e.g., "Generated key results successfully")
 * @returns {Object} response.data - Generated data wrapper
 * @returns {Object} response.data.objective - Objective information
 * @returns {number} response.data.objective.id - Objective ID
 * @returns {string} response.data.objective.title - Objective title
 * @returns {Array<Object>} response.data.suggestions - Array of suggested key results
 * @returns {string} response.data.suggestions[].title - Key result title suggestion
 * @returns {number} response.data.suggestions[].target_value - Suggested target value
 * @returns {number} response.data.suggestions[].start_value - Starting baseline value for the KR
 * @returns {string} response.data.suggestions[].unit - Suggested unit of measurement (e.g., '%', 'users', 'revenue')
 * @returns {number} response.data.suggestions[].weight - Suggested weight for KR distribution (0-1)
 * @returns {string} response.data.suggestions[].due_date - Due date in YYYY-MM-DD format
 * @returns {string} response.data.suggestions[].evaluation_method - Evaluation method for the KR
 *   - 'MAXIMIZE' - Maximize the metric value
 *   - 'MINIMIZE' - Minimize the metric value
 *   - 'TARGET' - Reach a specific target value
 * @returns {Object} response.data.suggestions[].evaluation - AI evaluation of the suggestion
 * @returns {number} response.data.suggestions[].evaluation.fit_score - Fit score for objective (0-100, 100 = perfect fit)
 * @returns {string} response.data.suggestions[].evaluation.fit_reason - Explanation of how this KR supports the objective
 * @returns {Array<string>} response.data.suggestions[].evaluation.issues - Array of potential issues or improvements
 * @returns {Object} response.data.overall_feedback - Overall feedback about the generated key results set
 * @returns {string} response.data.overall_feedback.summary - Summary of the suggestions
 * @returns {string} response.data.overall_feedback.alignment_analysis - Analysis of alignment with objective
 * @returns {Array<string>} response.data.overall_feedback.risks - Identified risks or challenges
 * @returns {Array<string>} response.data.overall_feedback.recommendations - Recommendations for improvement
 * 
 * @throws {Error} If generation fails:
 *   - 400: Invalid objectiveId or invalid payload (count out of range, invalid language)
 *   - 401: User not authenticated
 *   - 404: Objective not found
 *   - 422: Validation error (missing required fields or constraint format issues)
 *   - 502: AI provider error (couldn't generate suggestions)
 * 
 * @description Generate measurable Key Results and fit evaluations for a specific objective.
 * Uses AI to create smart suggestions based on the objective title and description.
 * Each suggestion includes:
 * - A measurable title with specific targets
 * - Target value, start value, and unit of measurement
 * - Suggested weight distribution
 * - Evaluation method (MAXIMIZE, MINIMIZE, or TARGET)
 * - AI evaluation with fit score and reasoning
 * - Potential issues or improvement suggestions
 * - Overall feedback with summary, alignment analysis, risks, and recommendations
 * 
 * The fit_score indicates how well the suggested KR supports the objective (0-100).
 * Higher scores mean better alignment with the objective.
 * 
 * @example
 * // Generate 5 Vietnamese key result suggestions for objective with ID 10
 * const response = await generateKeyResultsForObjective(10, {
 *   count: 5,
 *   language: 'vi',
 *   constraints: {
 *     due_date: '2026-12-31',
 *     unit: '%',
 *     evaluation_method: 'MAXIMIZE',
 *     context: 'Fintech startup with 3 engineers'
 *   }
 * });
 * 
 * // Response structure:
 * // {
 * //   success: true,
 * //   message: 'Generated key results successfully',
 * //   data: {
 * //     objective: {
 * //       id: 10,
 * //       title: 'Increase customer retention'
 * //     },
 * //     suggestions: [
 * //       {
 * //         title: 'Increase 90-day retention rate to 75%',
 * //         target_value: 75,
 * //         start_value: 45,
 * //         unit: '%',
 * //         weight: 0.25,
 * //         due_date: '2026-12-31',
 * //         evaluation_method: 'MAXIMIZE',
 * //         evaluation: {
 * //           fit_score: 92,
 * //           fit_reason: 'Directly supports objective with measurable outcome.',
 * //           issues: []
 * //         }
 * //       },
 * //       ... (4 more suggestions)
 * //     ],
 * //     overall_feedback: {
 * //       summary: 'Suggested KRs are balanced and measurable.',
 * //       alignment_analysis: 'All KRs directly support the objective with clear metrics.',
 * //       risks: ['High target may be challenging'],
 * //       recommendations: ['Consider breaking KR 3 into smaller milestones']
 * //     }
 * //   }
 * // }
 * 
 * @example
 * // Generate 3 English suggestions with minimal constraints
 * const response = await generateKeyResultsForObjective(10, {
 *   count: 3,
 *   language: 'en'
 * });
 */
export const generateKeyResultsForObjective = async (objectiveId, params) => {
  try {
    const response = await axiosClient.post(
      `/objectives/${objectiveId}/key-results/generate`,
      params,
      {
        timeout: 180000 // 180 seconds - AI generation can take a while
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
