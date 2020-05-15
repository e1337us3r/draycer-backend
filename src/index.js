const Express = require("express");
const http = require("http");
const SocketIo = require("socket.io");
const BodyParser = require("body-parser");
const Cors = require("cors");
const router = require("./core/router");
const CONFIG = require("./core/config");
const Logger = require("./core/logger");
const LoggerMiddleware = require("./middleware/LoggerMiddleware");
const AuthMiddleware = require("./middleware/AuthMiddleware");
const Socket = require("./core/socketmaster");
const db = require("./db");
const SceneService = require("./api/scene/v1/scene.service");

(async () => {
  const app = Express();
  const server = http.createServer(app);
  const io = SocketIo(server);

  await db.initializeDb();
  await SceneService.addAllJobsToQueue();

  Socket.init(io);
  app.use(Cors());

  app.use(BodyParser.json({ limit: "50mb" }));
  app.use(BodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(
    BodyParser.urlencoded({
      extended: true
    })
  );

  app.use(LoggerMiddleware);
  app.use(AuthMiddleware);
  app.use("/api", router);

  server.listen(CONFIG.port, "0.0.0.0", () => {
    Logger.info(`Server listening on port ${CONFIG.port}`);
  });
})();
