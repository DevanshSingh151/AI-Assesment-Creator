// Vercel entrypoint wrapper for Express backend
const app = require('./dist/index.js').default;
module.exports = app;
