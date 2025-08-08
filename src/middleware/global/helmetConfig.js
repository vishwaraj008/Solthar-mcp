// middleware/global/helmetConfig.js

const helmet = require("helmet");

const env = process.env.NODE_ENV || "development";

const helmetConfig = {
  contentSecurityPolicy:
    env === "production"
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
          },
        }
      : false, // disable CSP in dev to avoid local script errors

  crossOriginEmbedderPolicy: true, // allow media or canvas embedding if needed

  referrerPolicy: { policy: "no-referrer" },

  frameguard: {
    action: "deny", // prevent clickjacking
  },

  hsts:
    env === "production"
      ? {
          maxAge: 63072000, // 2 years
          includeSubDomains: true,
          preload: true,
        }
      : false,

  dnsPrefetchControl: { allow: false },

  hidePoweredBy: true,
  xssFilter: true,

  permittedCrossDomainPolicies: {
    permittedPolicies: "none",
  },

  // Optional: set `expect-ct` if using certificate transparency
  // expectCt: {
  //   enforce: true,
  //   maxAge: 30,
  //   reportUri: 'https://your.report.uri',
  // },
};

module.exports = helmetConfig;
