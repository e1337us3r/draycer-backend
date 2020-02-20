const SceneController = {
  path: "/scene",
  mount(router) {
    router.get(SceneController.path, async (req, res) => {
      res.send("/scene");
    });
  }
};

module.exports = SceneController;
