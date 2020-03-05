const newSocketListeners = [];

const SocketMaster = {
  workerPool: [],
  init(io) {
    SocketMaster.io = io;

    io.on("connection", socket => {
      console.log("connected");
      this.newSocketConnected(socket);

      socket.on("disconnect", () => {
        console.log("disconnected");
        // remove socket from pool
        this.workerPool.splice(this.workerPool.indexOf(socket), 1);
      });

    });
  },
  registerNewSocketListener(listener) {
    newSocketListeners.push(listener);
  },
  newSocketConnected(socket) {
    this.workerPool.push(socket);

    for (const newSocketListener of newSocketListeners) {
      newSocketListener(socket);
    }
  }
};

module.exports = SocketMaster;
