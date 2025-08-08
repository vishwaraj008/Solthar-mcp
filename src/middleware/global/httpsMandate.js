function enforceHttps(req, res, next) {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    return next();
  }
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    return next();
  }
  return res.redirect(`https://${req.headers.host}${req.url}`);
}

module.exports = { enforceHttps };
