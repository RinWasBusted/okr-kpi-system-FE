import axiosClient from '../utils/axios.js';

// ==================== OBJECTIVE FEEDBACKS ====================

/**
 * Get list of feedbacks for an objective
 * @async
 * @function listFeedbacks
 * @param {number} objectiveId - The objective ID (required)
 * @param {Object} [params] - Query parameters
 * @param {string} [params.type] - Filter by feedback type
 *   - PRAISE: Positive feedback about progress
 *   - CONCERN: Issues or risks identified
 *   - SUGGESTION: Recommendations for improvement
 *   - QUESTION: Questions or clarifications needed
 *   - BLOCKER: Critical blockers preventing progress
 * @param {string} [params.sentiment] - Filter by sentiment
 *   - POSITIVE: Positive tone
 *   - NEUTRAL: Neutral tone
 *   - NEGATIVE: Negative tone
 *   - MIXED: Mixed sentiment
 *   - UNKNOWN: Could not determine sentiment
 * @param {string} [params.status] - Filter by status
 *   - ACTIVE: Actively being discussed
 *   - RESOLVED: Issue has been resolved
 *   - FLAGGED: Flagged for attention
 * @param {number} [params.kr_tag_id] - Filter by specific key result tag (optional)
 * @param {number} [params.page=1] - Current page number
 * @param {number} [params.per_page=20] - Records per page (default: 20)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of top-level feedback objects
 * @returns {number} response.data[].id - Feedback ID
 * @returns {number} response.data[].objective_id - Associated objective ID
 * @returns {number} response.data[].user_id - User who posted feedback
 * @returns {string} response.data[].content - Feedback content
 * @returns {string} response.data[].type - Feedback type (PRAISE, CONCERN, SUGGESTION, QUESTION, BLOCKER)
 * @returns {string} response.data[].sentiment - Sentiment (POSITIVE, NEUTRAL, NEGATIVE, MIXED, UNKNOWN)
 * @returns {string} response.data[].status - Status (ACTIVE, RESOLVED, FLAGGED)
 * @returns {number} [response.data[].kr_tag_id] - Associated key result ID (nullable)
 * @returns {number} [response.data[].parent_feedback_id] - Parent feedback ID (nullable, always null for top-level)
 * @returns {string} response.data[].created_at - Creation timestamp (ISO 8601)
 * @returns {string} response.data[].updated_at - Last update timestamp (ISO 8601)
 * @returns {Object} response.meta - Pagination metadata
 * @returns {number} response.meta.total - Total number of feedbacks
 * @returns {number} response.meta.page - Current page number
 * @returns {number} response.meta.per_page - Records per page
 * @returns {number} response.meta.last_page - Last page number
 * 
 * @throws {Error} If request fails:
 *   - 403: No permission to view this objective
 *   - 404: Objective not found
 * 
 * @description Retrieve top-level feedbacks only (replies are accessed separately).
 * Results are paginated and support filtering by type, sentiment, and status.
 * 
 * @example
 * const feedbacks = await listFeedbacks(1, {
 *   type: 'CONCERN',
 *   status: 'ACTIVE',
 *   page: 1,
 *   per_page: 20
 * });
 */
export const listFeedbacks = async (objectiveId, params = {}) => {
  const response = await axiosClient.get(`/objectives/${objectiveId}/feedbacks`, { params });
  return response.data;
};

/**
 * Create a feedback on an objective
 * @async
 * @function createFeedback
 * @param {number} objectiveId - The objective ID (required)
 * @param {Object} data - Feedback data
 * @param {string} data.content - Feedback content (required, 1-5000 characters)
 * @param {string} data.type - Type of feedback (required)
 *   - PRAISE: Positive feedback about progress
 *   - CONCERN: Issues or risks identified
 *   - SUGGESTION: Recommendations for improvement
 *   - QUESTION: Questions or clarifications needed
 *   - BLOCKER: Critical blockers preventing progress
 * @param {number} [data.kr_tag_id] - Tag a specific key result within this objective (optional, nullable)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {Object} response.data - Created feedback object
 * @returns {Object} response.data.feedback - Feedback details
 * @returns {number} response.data.feedback.id - Feedback ID
 * @returns {number} response.data.feedback.objective_id - Associated objective ID
 * @returns {number} response.data.feedback.user_id - User who posted feedback (current user)
 * @returns {string} response.data.feedback.content - Feedback content
 * @returns {string} response.data.feedback.type - Feedback type
 * @returns {string} response.data.feedback.sentiment - AI-detected sentiment (POSITIVE, NEUTRAL, NEGATIVE, MIXED, UNKNOWN)
 * @returns {string} response.data.feedback.status - Status (default: ACTIVE)
 * @returns {number} [response.data.feedback.kr_tag_id] - Associated key result ID (nullable)
 * @returns {number} [response.data.feedback.parent_feedback_id] - Parent feedback ID (nullable, always null for top-level)
 * @returns {string} response.data.feedback.created_at - Creation timestamp (ISO 8601)
 * @returns {string} response.data.feedback.updated_at - Last update timestamp (ISO 8601)
 * 
 * @throws {Error} If creation fails:
 *   - 403: No permission to view this objective
 *   - 404: Objective not found
 *   - 422: Validation error or kr_tag_id does not belong to this objective
 * 
 * @description Any user who can view the objective can post feedback.
 * Sentiment is AI-detected automatically.
 * 
 * @example
 * const newFeedback = await createFeedback(1, {
 *   content: 'Great progress on user onboarding!',
 *   type: 'PRAISE',
 *   kr_tag_id: 5
 * });
 */
export const createFeedback = async (objectiveId, data) => {
  const response = await axiosClient.post(`/objectives/${objectiveId}/feedbacks`, data);
  return response.data;
};

/**
 * Get a single feedback
 * @async
 * @function getFeedback
 * @param {number} objectiveId - The objective ID (required)
 * @param {number} feedbackId - The feedback ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {Object} response.data - Feedback object
 * @returns {Object} response.data.feedback - Feedback details
 * @returns {number} response.data.feedback.id - Feedback ID
 * @returns {number} response.data.feedback.objective_id - Associated objective ID
 * @returns {number} response.data.feedback.user_id - User who posted feedback
 * @returns {string} response.data.feedback.content - Feedback content
 * @returns {string} response.data.feedback.type - Feedback type (PRAISE, CONCERN, SUGGESTION, QUESTION, BLOCKER)
 * @returns {string} response.data.feedback.sentiment - Sentiment (POSITIVE, NEUTRAL, NEGATIVE, MIXED, UNKNOWN)
 * @returns {string} response.data.feedback.status - Status (ACTIVE, RESOLVED, FLAGGED)
 * @returns {number} [response.data.feedback.kr_tag_id] - Associated key result ID (nullable)
 * @returns {number} [response.data.feedback.parent_feedback_id] - Parent feedback ID (nullable)
 * @returns {string} response.data.feedback.created_at - Creation timestamp (ISO 8601)
 * @returns {string} response.data.feedback.updated_at - Last update timestamp (ISO 8601)
 * 
 * @throws {Error} If request fails:
 *   - 403: No permission to access this feedback
 *   - 404: Feedback or objective not found
 * 
 * @description Retrieve detailed information about a specific feedback.
 * 
 * @example
 * const feedback = await getFeedback(1, 42);
 */
export const getFeedback = async (objectiveId, feedbackId) => {
  const response = await axiosClient.get(`/objectives/${objectiveId}/feedbacks/${feedbackId}`);
  return response.data;
};

/**
 * Partially update a feedback
 * @async
 * @function updateFeedback
 * @param {number} objectiveId - The objective ID (required)
 * @param {number} feedbackId - The feedback ID (required)
 * @param {Object} data - Update data (at least one field required)
 * @param {string} [data.content] - Feedback content (optional, 1-5000 characters)
 * @param {string} [data.type] - Type of feedback (optional)
 *   - PRAISE, CONCERN, SUGGESTION, QUESTION, BLOCKER
 * @param {string} [data.sentiment] - Manual override of AI-detected sentiment (optional)
 *   - POSITIVE, NEUTRAL, NEGATIVE, MIXED, UNKNOWN
 * @param {string} [data.status] - Status (optional)
 *   - ACTIVE, RESOLVED, FLAGGED
 * @param {number} [data.kr_tag_id] - Tag a key result (optional, nullable)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Updated feedback object
 * @returns {Object} response.data.feedback - Feedback details
 * @returns {number} response.data.feedback.id - Feedback ID
 * @returns {string} response.data.feedback.content - Updated content
 * @returns {string} response.data.feedback.type - Updated type
 * @returns {string} response.data.feedback.sentiment - Updated sentiment
 * @returns {string} response.data.feedback.status - Updated status
 * @returns {number} [response.data.feedback.kr_tag_id] - Updated key result ID (nullable)
 * @returns {string} response.data.feedback.updated_at - Last update timestamp (ISO 8601)
 * 
 * @throws {Error} If update fails:
 *   - 400: No fields provided to update
 *   - 403: Not author or ADMIN_COMPANY
 *   - 404: Feedback not found
 *   - 422: Validation error
 * 
 * @description Author or ADMIN_COMPANY only.
 * Send only fields you want to change (partial update).
 * 
 * @example
 * const updated = await updateFeedback(1, 42, {
 *   status: 'RESOLVED',
 *   sentiment: 'POSITIVE'
 * });
 */
export const updateFeedback = async (objectiveId, feedbackId, data) => {
  const response = await axiosClient.patch(`/objectives/${objectiveId}/feedbacks/${feedbackId}`, data);
  return response.data;
};

/**
 * Delete a feedback and its replies
 * @async
 * @function deleteFeedback
 * @param {number} objectiveId - The objective ID (required)
 * @param {number} feedbackId - The feedback ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Deleted feedback ID
 * @returns {number} response.data.id - The ID of deleted feedback
 * 
 * @throws {Error} If deletion fails:
 *   - 403: Not author or ADMIN_COMPANY
 *   - 404: Feedback not found
 * 
 * @description Author or ADMIN_COMPANY only.
 * Deleting a feedback also deletes all its replies.
 * 
 * @example
 * const deleted = await deleteFeedback(1, 42);
 */
export const deleteFeedback = async (objectiveId, feedbackId) => {
  const response = await axiosClient.delete(`/objectives/${objectiveId}/feedbacks/${feedbackId}`);
  return response.data;
};

// ==================== FEEDBACK REPLIES ====================

/**
 * Get list of replies to a feedback
 * @async
 * @function listReplies
 * @param {number} id - Parent feedback ID (required)
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Array<Object>} response.data - Array of reply objects (direct replies only)
 * @returns {number} response.data[].id - Reply ID
 * @returns {number} response.data[].objective_id - Associated objective ID
 * @returns {number} response.data[].user_id - User who posted reply
 * @returns {string} response.data[].content - Reply content
 * @returns {string} response.data[].type - Reply type (PRAISE, CONCERN, SUGGESTION, QUESTION, BLOCKER)
 * @returns {string} response.data[].sentiment - Sentiment (POSITIVE, NEUTRAL, NEGATIVE, MIXED, UNKNOWN)
 * @returns {string} response.data[].status - Status (ACTIVE, RESOLVED, FLAGGED)
 * @returns {number} [response.data[].kr_tag_id] - Associated key result ID (nullable)
 * @returns {number} response.data[].parent_feedback_id - Parent feedback ID
 * @returns {string} response.data[].created_at - Creation timestamp (ISO 8601)
 * @returns {string} response.data[].updated_at - Last update timestamp (ISO 8601)
 * 
 * @throws {Error} If request fails:
 *   - 400: Trying to get replies of a reply (max depth is 1)
 *   - 404: Parent feedback not found
 * 
 * @description Returns all direct replies to a top-level feedback.
 * Replies of replies are not supported (maximum depth = 1).
 * To check if a feedback is a reply, check if parent_feedback_id is not null.
 * 
 * @example
 * const replies = await listReplies(42);
 */
export const listReplies = async (id) => {
  const response = await axiosClient.get(`/feedbacks/${id}/replies`);
  return response.data;
};

/**
 * Create a reply to a feedback
 * @async
 * @function createReply
 * @param {number} id - Parent feedback ID (required)
 * @param {Object} data - Reply data
 * @param {string} data.content - Reply content (required, 1-5000 characters)
 * @param {string} data.type - Type of reply (required)
 *   - PRAISE: Positive feedback
 *   - CONCERN: Issues or risks
 *   - SUGGESTION: Recommendations
 *   - QUESTION: Questions or clarifications
 *   - BLOCKER: Critical blockers
 * 
 * @returns {Promise<Object>} Response object
 * @returns {boolean} response.success - Whether request was successful
 * @returns {string} response.message - Response message
 * @returns {Object} response.data - Created reply object
 * @returns {Object} response.data.feedback - Reply details
 * @returns {number} response.data.feedback.id - Reply ID
 * @returns {number} response.data.feedback.objective_id - Associated objective ID
 * @returns {number} response.data.feedback.user_id - User who posted reply (current user)
 * @returns {string} response.data.feedback.content - Reply content
 * @returns {string} response.data.feedback.type - Reply type
 * @returns {string} response.data.feedback.sentiment - AI-detected sentiment (asynchronous)
 * @returns {string} response.data.feedback.status - Status (default: ACTIVE)
 * @returns {number} [response.data.feedback.kr_tag_id] - Associated key result ID (nullable)
 * @returns {number} response.data.feedback.parent_feedback_id - Parent feedback ID
 * @returns {string} response.data.feedback.created_at - Creation timestamp (ISO 8601)
 * @returns {string} response.data.feedback.updated_at - Last update timestamp (ISO 8601)
 * 
 * @throws {Error} If creation fails:
 *   - 400: Cannot reply to a reply (max depth is 1)
 *   - 403: No permission to view the objective
 *   - 404: Parent feedback not found
 *   - 422: Validation error
 * 
 * @description Create a reply to a top-level feedback.
 * Replying to a reply is not allowed (maximum nesting depth is 1).
 * Sentiment is AI-detected asynchronously.
 * You can use the parent objective ID from the response to fetch more details if needed.
 * 
 * @example
 * const newReply = await createReply(42, {
 *   content: 'Good point! We are already addressing this.',
 *   type: 'SUGGESTION'
 * });
 */
export const createReply = async (id, data) => {
  const response = await axiosClient.post(`/feedbacks/${id}/replies`, data);
  return response.data;
};
