const SceneService = require("./scene.service");

const SceneController = {
  path: "/v1/scene",
  mount(router) {
    router.get(SceneController.path, async (req, res) => {
      res.send(await SceneService.getAll(req.state.user_id));
    });

    router.post(SceneController.path, async (req, res) => {
      res.send(await SceneService.create(req.state.user_id, req.body.scene));
    });

    router.get(SceneController.path + "/:id", async (req, res) => {
      res.send(await SceneService.get(req.state.user_id, req.params.id));
    });
  }
};

module.exports = SceneController;
