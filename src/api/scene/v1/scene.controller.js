const SceneRepository = require("./scene.repository");

const SceneController = {
  path: "/v1/scene",
  mount(router) {
    router.get(SceneController.path, async (req, res) => {
      res.send(await SceneRepository.getAll(req.state.user_id));
    });

    router.post(SceneController.path, async (req, res) => {
      res.send(await SceneRepository.create(req.state.user_id, req.body.scene));
    });

    router.get(SceneController.path + "/:id", async (req, res) => {
      res.send(await SceneRepository.get(req.state.user_id, req.params.id));
    });
  }
};

module.exports = SceneController;
