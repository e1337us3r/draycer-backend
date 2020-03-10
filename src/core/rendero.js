const Jimp = require("jimp");
const Logger = require("./logger");
const { workerPool, registerNewSocketListener } = require("./socketmaster");

const waitingRenderQueue = [];
const renderJobs = {};

const Rendero = {
  addRenderJob: (id, scene) => {
    const canRender = workerPool.length > 0;
    const WIDTH = scene.WIDTH;
    const HEIGHT = scene.HEIGHT;

    const job = {
      id,
      scene,
      jimp: null,
      render: null,
      pixelCount: WIDTH * HEIGHT,
      renderedPixelCount: 0,
      status: "waiting_workers",
      WIDTH,
      HEIGHT
    };

    Logger.debug({ event: "JOB_CREATED", id: job.id });

    renderJobs[id] = job;

    if (!canRender) waitingRenderQueue.push(job);
    else Rendero.startRender(job);
  },
  startRender: job => {
    Logger.debug({ event: "JOB_STARTING", id: job.id });
    const { scene, id, WIDTH, HEIGHT } = job;
    job.status = "rendering";

    new Jimp(WIDTH, HEIGHT, 0x000000ff, (err, image) => {
      if (err) {
        job.status = "error#001";
        throw err;
      }

      job.jimp = image;

      // Divide height of scene into equal parts
      const hStep = Math.floor(HEIGHT / workerPool.length);

      let yTop = HEIGHT;

      for (const worker of workerPool) {
        const yEnd = yTop;
        yTop -= hStep;
        const yStart = yTop < hStep ? 0 : yTop;

        Logger.debug({
          xStart: 0,
          yStart,
          yEnd,
        })

        worker.emit("START_RENDER", {
          scene,
          xStart: 0,
          yStart,
          yEnd,
          height: HEIGHT,
          width: WIDTH,
          id
        });
      }
    });
  },
  getRenderJob: id => {
    return renderJobs[id];
  },
  registerWorkerListener: worker => {
    worker.on("ROW_RENDERED", result => {
      Logger.debug("ROW_RENDERED");
      const { id, renders } = result;

      const job = renderJobs[id];

      if (!job) return;

      for (const render of renders) {
        const { coord, color } = render;
        job.jimp.setPixelColor(
          Jimp.rgbaToInt(color.r, color.g, color.b, 255),
          coord.x,
          coord.y
        );
      }

      job.renderedPixelCount += renders.length;

      if (job.renderedPixelCount === job.pixelCount) {
        // render has finished
        Logger.debug("RENDER_COMPLETED");

        job.jimp.getBase64(Jimp.MIME_PNG, (err, png) => {
            if(err) throw err;

          job.status = "completed";
          job.render = png;
          Logger.debug(png);

          // free big objects from memory
          job.jimp = null;
          job.scene = null;
        });
      }
    });

    // if there are jobs in waitingRenderQueue, start the first job
    if (waitingRenderQueue.length > 0)
      Rendero.startRender(waitingRenderQueue.shift());
  }
};

registerNewSocketListener(Rendero.registerWorkerListener);

module.exports = Rendero;
