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

    router.post(SceneController.path + "/:id/pause", async (req, res) => {
      res.send(await SceneService.pauseJob(req.state.user_id, req.params.id));
    });

    router.post(SceneController.path + "/:id/continue", async (req, res) => {
      res.send(
        await SceneService.continueJob(req.state.user_id, req.params.id)
      );
    });

    router.get(SceneController.path + "/:id", async (req, res) => {
      res.send(await SceneService.get(req.state.user_id, req.params.id));
    });


    router.get(SceneController.path + "/:id/work_record", async (req, res) => {
      res.send(await SceneService.getWorkRecords(req.state.user_id, req.params.id));
    });
  }
};

module.exports = SceneController;
