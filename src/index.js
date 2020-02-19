const Express = require("express");
const http = require("http");
const SocketIo = require("socket.io");
const BodyParser = require("body-parser");
const Cors = require("cors");

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

app.get("/", async (req, res) => {
  res.send("hello world");
});

io.on("connection", async socket => {
  console.log("socket connected");
});

server.listen(7878, () => {
  console.log("Server listening on port 7878");
});
