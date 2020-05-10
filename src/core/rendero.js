const Jimp = require("jimp");
const Logger = require("./logger");
const { workerPool, registerNewSocketListener } = require("./socketmaster");

const waitingRenderQueue = [];
const renderJobs = {};
const BLOCK_WIDTH = 50;
const BLOCK_HEIGHT = 50;

const Rendero = {
  addRenderJob: (id, scene) => {
    const canRender = workerPool.length > 0;
    const WIDTH = scene.WIDTH;
    const HEIGHT = scene.HEIGHT;

    const job = {
      id,
      scene,
      render: null,
      pixelCount: WIDTH * HEIGHT,
      renderedPixelCount: 0,
      status: "waiting_workers",
      WIDTH,
      HEIGHT,
      waitingBlocks: [],
      renderingBlocks: {},
      finishedPixels: []
    };

    Logger.info({ event: "JOB_CREATED", id: job.id });

    for (let y = 0; y < HEIGHT; y += BLOCK_HEIGHT) {
      for (let x = 0; x < WIDTH; x += BLOCK_WIDTH) {
        job.waitingBlocks.push({
          p1: { x, y },
          p2: { x: x + BLOCK_WIDTH, y: y + BLOCK_HEIGHT }
        });
      }
    }

    Logger.debug({ event: "JOB_BLOCKS_CREATED", job });

    renderJobs[id] = job;

    waitingRenderQueue.push(job);

    if (canRender)
      for (const worker of workerPool) {
        Rendero.startRender(job, worker);
      }
  },
  startRender: (job, worker) => {
    Logger.info({ event: "JOB_RENDERING", id: job.id });
    const { scene, id, waitingBlocks, renderingBlocks, WIDTH, HEIGHT } = job;
    job.status = "rendering";

    const block = waitingBlocks.pop();
    const blockId = `${block.p1.x},${block.p1.y}`;

    renderingBlocks[blockId] = block;

    worker.assignedBlocks[blockId] = { ...block, jobId: id };

    worker.emit("RENDER_BLOCK", {
      scene,
      xStart: block.p1.x,
      yStart: block.p1.y,
      yEnd: block.p2.y,
      xEnd: block.p2.x,
      height: HEIGHT,
      width: WIDTH,
      jobId: id,
      blockId
    });
  },
  getRenderJob: id => {
    return renderJobs[id];
  },
  registerWorkerListener: worker => {
    worker.on("BLOCK_RENDERED", result => {
      const { jobId, blockId, renders } = result;

      const job = renderJobs[jobId];

      if (!job) return;

      Logger.info({ event: "BLOCK_RENDERED", id: jobId });

      delete job.renderingBlocks[blockId];

      delete worker.assignedBlocks[blockId];

      job.finishedPixels.push(...renders);

      job.renderedPixelCount += renders.length;

      Logger.info(
        `waitingblocks: ${job.waitingBlocks.length}  renderingBlocks: ${
          Object.keys(job.renderingBlocks).length
        }`
      );

      if (
        job.waitingBlocks.length === 0 &&
        Object.keys(job.renderingBlocks).length === 0
      ) {
        // render has finished
        Logger.info({ event: "RENDER_COMPLETED", id: job.id });

        // remove job from que
        waitingRenderQueue.shift();

        new Jimp(job.WIDTH, job.HEIGHT, 0x000000ff, (err, image) => {
          if (err) {
            job.status = "error#001";
            throw err;
          }

          Logger.info({ event: "RENDER_WRITING_PIXELS", id: job.id });
          for (const pixel of job.finishedPixels) {
            const { coord, color } = pixel;
            image.setPixelColor(
              Jimp.rgbaToInt(color.r, color.g, color.b, 255),
              coord.x,
              coord.y
            );
          }

          Logger.info({ event: "RENDER_WRITING_PIXELS_COMPLETED", id: job.id });
          Logger.info({ event: "RENDER_CREATING_PNG", id: job.id });
          image.getBase64(Jimp.MIME_PNG, (err, png) => {
            if (err) throw err;

            job.status = "completed";
            job.render = png;

            // free big objects from memory
            job.scene = null;

            Logger.info({ event: "RENDER_CREATING_PNG_COMPLETED", id: job.id });
          });
        });
      } else if (job.waitingBlocks.length > 0) {
        Rendero.startRender(job, worker);
      }
    });

    worker.assignedBlocks = {};

    // if there are jobs in waitingRenderQueue
    // try to find a job with waiting blocks and assign the worker
    if (waitingRenderQueue.length > 0)
      for (const waitingRenderQueueElement of waitingRenderQueue) {
        if (waitingRenderQueueElement.waitingBlocks.length > 0)
          Rendero.startRender(waitingRenderQueueElement, worker);
      }
  },
  disconnectedWorkerListener(worker) {
    if (worker.assignedBlocks) {
      for (const assignedBlockId of Object.keys(worker.assignedBlocks)) {
        const assignedBlock = worker.assignedBlocks[assignedBlockId];
        const job = renderJobs[assignedBlock.jobId];
        if (job) {
          // remove job from rendering blocks and add it back to waiting blocks
          // so that it can be rendered by another
          delete job.renderingBlocks[assignedBlockId];
          delete assignedBlock.jobId;
          job.waitingBlocks.push(assignedBlock);
        }
      }
    }
  }
};

registerNewSocketListener(
  Rendero.registerWorkerListener,
  Rendero.disconnectedWorkerListener
);

module.exports = Rendero;
