const Router = require("express-promise-router");
const SceneController = require("../api/scene/v1/scene.controller");
const UserController = require("../api/user/v1/user.controller");

const router = new Router();

SceneController.mount(router);
UserController.mount(router);

module.exports = router;
