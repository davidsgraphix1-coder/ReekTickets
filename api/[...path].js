const serverlessApp = require('../server/index');

module.exports = async (req, res) => {
  // serverlessApp is already wrapped with serverless-http in server/index.js
  // This function just proxies Vercel API requests into Express.
  return serverlessApp(req, res);
};