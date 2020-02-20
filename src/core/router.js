const Router = require("express-promise-router");
const SceneController = require("../api/scene/v1/scene.controller");

const router = new Router();

SceneController.mount(router);

module.exports = router;
