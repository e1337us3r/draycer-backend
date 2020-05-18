const Firebase = require("../core/firebase");

module.exports = async function AuthMiddleware(req, res, next) {
  let authToken = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    authToken = req.headers.authorization.split(" ")[1];
  }

  if (authToken && authToken.length > 10) {
    try {
      const userInfo = await Firebase.auth().verifyIdToken(authToken);
      req.state = { user_id: userInfo.uid };
      return next();
    } catch (e) {
      return res
        .status(401)
        .send({ error: "You are not authorized to make this request" });
    }
  } else {
    return res
      .status(401)
      .send({ error: "You are not authorized to make this request" });
  }
};
