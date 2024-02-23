const jwt = require('jsonwebtoken');

exports.verifyLogin = (req, res, next) => {
    const token = req.header("authorization");
  if (!token) return res.status(401).send("Access denied no token povided");
  // the try catch below will try to check if the sent token is valid
  // if not it will send an error
  // if it is valid it will continue to the next middleware
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};
