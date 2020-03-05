module.exports = async function AuthMiddleware(req, res, next) {
  req.state = { user_id: "test" };
  next();
};
