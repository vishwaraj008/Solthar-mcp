require('dotenv').config();
const express = require('express');

const corsOptions = require('./middleware/global/corsConfig');
const helmetConfig = require('./middleware/global/helmetConfig');
const { enforceHttps } = require('./middleware/global/httpsMandate');
const { errorLogger, errorResponder } = require('./middleware/global/errorHandler');
const authRoutes = require('./routes/authRoutes');
const mcpRoutes = require('./routes/mcp.routes');

const app = express();

app.use(require('cors')(corsOptions));
app.use(require('helmet')(helmetConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'production') {
  app.use(enforceHttps);
}
app.use('/mcp/user',authRoutes)
app.use('/mcp', mcpRoutes);

app.use(errorLogger);
app.use(errorResponder);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

module.exports = app;
