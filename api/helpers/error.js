/**
 * Throws an error with the specified status, statusCode, message, and identifier.
 *
 * @param {string} status - The status of the error.
 * @param {number} statusCode - The status code of the error.
 * @param {string} message - The error message.
 * @param {string} identifier - The identifier of the error.
 * @throws {Error} - The error object with the specified properties.
 */
const throwError = (status, statusCode, message, identifier) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.identifier = identifier;
  error.status = status;

  throw error;
};

exports.throwError = throwError;
