class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message); // Pass message to parent Error constructor
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
