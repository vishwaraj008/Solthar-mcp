
const isProdLike = ["production", "localprod"].includes(process.env.NODE_ENV);

function errorLogger(err, req, res, next) {
  if (!isProdLike) {
    console.error(
      JSON.stringify(
        {
          message: err.message,
          status: err.status || 500,
          metadata: err.metadata,
          stack: err.stack,
        },
        null,
        2
      )
    );
  }

  if (err.shouldReport !== false && process.env.NODE_ENV === "production") {
    // Only send to Sentry in *real* production
    Sentry.withScope((scope) => {
      if (err.metadata && Object.keys(err.metadata).length) {
        scope.setExtras(err.metadata);
      }
      scope.setTag("http_status", err.status || 500);
      Sentry.captureException(err);
    });
  }

  next(err);
}

function errorResponder(err, req, res, next) {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: isProdLike && err.userMessage ? err.userMessage : err.message,
    code: err.code || "UNKNOWN_ERROR",
    ...(!isProdLike && {
      metadata: err.metadata,
      stack: err.stack,
    }),
  });
}

module.exports = {
  errorLogger,
  errorResponder,
};
