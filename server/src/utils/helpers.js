/**
 * Server utility helpers.
 */

/**
 * Build a standardized success response.
 * @param {object} res - Express response object
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 */
export const sendResponse = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Build a paginated response.
 * @param {object} res
 * @param {number} statusCode
 * @param {Array} data
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 */
export const sendPaginatedResponse = (res, statusCode, data, page, limit, total) => {
  return res.status(statusCode).json({
    success: true,
    count: data.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data,
  });
};

/**
 * Parse pagination query params with defaults.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
