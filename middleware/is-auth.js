const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  // get token
  const token = authHeader.split(' ')[1];
  // invalid token
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }

  let decodedToken;
  // compare token
  try {
    decodedToken = jwt.verify(token, 'thisisaverysecrettoken');
  } catch (err) {
    req.isAuth =false;
    return next();
  }
  // token does not match
  if (!decodedToken) {
    req.isAuth =false;
    return next();
  }
  // valid token
  req.isAuth = true;
  req.userId = decodedToken.userId;
  return next();
}