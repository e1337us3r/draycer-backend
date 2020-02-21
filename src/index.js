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

const app = Express();
const server = http.createServer(app);
const io = SocketIo(server);

app.use(Cors());
app.use(BodyParser.json());
app.use(
  BodyParser.urlencoded({
    extended: true
  })
);

app.use(LoggerMiddleware);
app.use(AuthMiddleware);
app.use(router);

io.on("connection", async socket => {
  console.log("socket connected");
});

server.listen(CONFIG.port, () => {
  Logger.info(`Server listening on port ${CONFIG.port}`);
});
