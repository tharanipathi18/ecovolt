/**
 * Request validation middleware factory.
 * Validates request body, query, or params against a validation schema.
 *
 * @param {Function} validationFn - Validation function that returns { isValid, errors }
 * @param {'body'|'query'|'params'} source - Request property to validate
 */
export const validate = (validationFn, source = 'body') => {
  return (req, res, next) => {
    const { isValid, errors } = validationFn(req[source]);

    if (!isValid) {
      res.status(400);
      throw new Error(errors.join(', '));
    }

    next();
  };
};
