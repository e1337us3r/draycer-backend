const newSocketListeners = [];
const disconnectedSocketListeners = [];

const SocketMaster = {
  workerPool: [],
  init(io) {
    SocketMaster.io = io;

    io.on("connection", socket => {
      console.log("connected");
      this.newSocketConnected(socket);

      socket.on("disconnect", () => {
        console.log("disconnected");
        this.socketDisconnected(socket);
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
