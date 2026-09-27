const mockApplogin = require('./responses/applogin.json');
const mockRefreshToken = require('./responses/refreshToken.json');
const mockKeepalive = require('./responses/keepalive.json');

module.exports = function (app) {
  app.get('/auth/applogin', function (req, res) {
    res.json(mockApplogin);
  });

  app.get('/auth/keepalive', function (req, res) {
    res.json(mockKeepalive);
  });
  app.get('/auth/refreshToken', function (req, res) {
    res.json(mockRefreshToken);
  });
};
