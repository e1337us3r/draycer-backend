const UserService = require("./user.service");

const UserController = {
  path: "/v1/user",
  mount(router) {
    router.post(UserController.path, async (req, res) => {
      res.send(await UserService.create(req.state.user_id, req.body));
    });

    router.get(UserController.path + "/work_record", async (req, res) => {
      res.send(await UserService.getWorkRecords(req.state.user_id));
    });
  }
};

module.exports = UserController;
