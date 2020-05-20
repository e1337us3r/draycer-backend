const Logger = require("./logger");
const newSocketListeners = [];
const disconnectedSocketListeners = [];

const SocketMaster = {
  workerPool: [],
  init(io) {
    SocketMaster.io = io;

    io.on("connection", socket => {
      Logger.info({ event: "WORKER_CONNECTED" });

      socket.on("disconnect", () => {
        Logger.info({ event: "WORKER_DISCONNECTED" });
        this.socketDisconnected(socket);
      });

      socket.on("join", (data) => {
        Logger.info({ event: "WORKER_JOINED_POOL" });
        socket.userId = data.userId;
        this.newSocketConnected(socket);
      });
    });
  },
  registerNewSocketListener(newSocketListener, disconnectedSocketListener) {
    newSocketListeners.push(newSocketListener);
    disconnectedSocketListeners.push(disconnectedSocketListener);
  },
  socketDisconnected(socket) {
    // remove socket from pool
    this.workerPool.splice(this.workerPool.indexOf(socket), 1);

    for (const disconnectedSocketListener of disconnectedSocketListeners) {
      disconnectedSocketListener(socket);
    }
  },

  newSocketConnected(socket) {
    this.workerPool.push(socket);

    for (const newSocketListener of newSocketListeners) {
      newSocketListener(socket);
    }
  }
};

module.exports = SocketMaster;
