const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

const mountRoute = (basePath, relativeModule) => {
  const modulePath = path.join(__dirname, relativeModule);
  try {
    const router = require(modulePath);
    app.use(basePath, router);
  } catch (err) {
    const moduleMissing =
      err.code === 'MODULE_NOT_FOUND' && err.message.includes(relativeModule.replace(/\//g, path.sep));
    if (moduleMissing) {
      console.warn(`[routes] Skipping ${basePath} — ${relativeModule} not implemented yet`);
    } else {
      throw err;
    }
  }
};

mountRoute('/api/auth', 'routes/authRoutes');
mountRoute('/api/games', 'routes/gameRoutes');
mountRoute('/api/categories', 'routes/categoryRoutes');
mountRoute('/api/downloads', 'routes/downloadRoutes');
mountRoute('/api/admin', 'routes/adminRoutes');

app.use(notFound);
app.use(errorHandler);

module.exports = app;
