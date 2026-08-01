/**
 * Request validation middleware factory.
 *
 * Validates the request body (or query/params) against a validator function.
 * On failure, responds immediately with HTTP 400 and a structured errors array
 * so clients can display per-field messages.
 *
 * @param {Function} validationFn - Must return { isValid: boolean, errors: string[] }
 * @param {'body'|'query'|'params'} source   - Which part of req to validate
 */
export const validate = (validationFn, source = 'body') => {
  return (req, res, next) => {
    const { isValid, errors } = validationFn(req[source]);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0], // Primary message (first error)
        errors,             // Full list so clients can highlight each field
      });
    }

    next();
  };
};
