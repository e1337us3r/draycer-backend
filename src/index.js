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

const app = Express();
const server = http.createServer(app);
const io = SocketIo(server);

Socket.init(io);
app.use(Cors());
app.use(BodyParser.json());
app.use(
  BodyParser.urlencoded({
    extended: true
  })
);

app.use(LoggerMiddleware);
app.use(AuthMiddleware);
app.use("/api", router);

server.listen(CONFIG.port, "0.0.0.0",() => {
  Logger.info(`Server listening on port ${CONFIG.port}`);
});
