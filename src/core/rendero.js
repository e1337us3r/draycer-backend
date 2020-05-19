const Logger = require("./logger");
const { workerPool, registerNewSocketListener } = require("./socketmaster");
const { saveProgressQueue, saveWorkRecordQueue } = require("./queue");

let waitingRenderQueue = [];
const renderJobs = {};
const BLOCK_WIDTH = 50;
const BLOCK_HEIGHT = 50;

const Rendero = {
  removeJob(id) {
    Logger.info({ event: "JOB_PAUSED", id });
    const job = renderJobs[id];
    if (job) {
      job.status = "paused";
      saveProgressQueue.add(job);
      delete renderJobs[id];
    }

    waitingRenderQueue = waitingRenderQueue.filter(jobb => {
      return jobb.id !== id;
    });
  },
  createRenderBlocks(height, width) {
    const results = [];
    for (let y = 0; y < height; y += BLOCK_HEIGHT) {
      for (let x = 0; x < width; x += BLOCK_WIDTH) {
        results.push([x, y, x + BLOCK_WIDTH, y + BLOCK_HEIGHT]);
      }
    }
    return results;
  },
  areWorkersAvailable() {
    return workerPool.length > 0;
  },
  addRenderJobsToQueue(jobs) {
    waitingRenderQueue.push(...jobs);
  },
  addRenderJobToQueue: job => {
    const canRender = Rendero.areWorkersAvailable();

    Logger.info({ event: "JOB_ADDED_TO_QUEUE", id: job.id });

    waitingRenderQueue.push(job);

    if (canRender)
      for (const worker of workerPool) {
        Rendero.startRender(job, worker);
      }
  },
  startRender: (job, worker) => {
    SceneService.startJob(job).then(updatedJob => {
      job = updatedJob;
      renderJobs[job.id] = job;

      const block = job.render_state.waiting_blocks.pop();
      const blockId = `${block[0]}:${block[1]}`;
      Logger.info({ event: "JOB_RENDERING", id: job.id, blockId });

      job.render_state.rendering_blocks[blockId] = block;

      worker.assignedBlocks[blockId] = { ...block, jobId: job.id };

      worker.emit("RENDER_BLOCK", {
        block,
        height: job.metadata.height,
        width: job.metadata.width,
        jobId: job.id,
        blockId
      });
    });
  },
  registerWorkerListener: worker => {
    worker.on("BLOCK_RENDERED", async result => {
      const { jobId, blockId, renders } = result;
      delete worker.assignedBlocks[blockId];

      const job = renderJobs[jobId];

      if (!job) return;

      // Ignore this block if job is not in rendering status
      if (job.status !== "rendering") return;

      Logger.info({
        event: "BLOCK_RENDERED",
        id: jobId,
        blockId,
        waitingBlocks: job.render_state.waiting_blocks.length
      });

      saveWorkRecordQueue.add({
        user_id: job.user_id,
        job_id: job.id,
        last_block_id: blockId
      });

      delete job.render_state.rendering_blocks[blockId];

      job.render_state.finished_pixels.push(...renders);

      if (
        job.render_state.waiting_blocks.length === 0 &&
        Object.keys(job.render_state.rendering_blocks).length === 0
      ) {
        // render has finished
        Logger.info({ event: "RENDER_COMPLETED", id: job.id });

        // remove job from que
        waitingRenderQueue.shift();

        saveProgressQueue.add(job);
        delete renderJobs[job.id];
        Logger.info({ event: "RENDER_RESULT_SAVE_QUEUED", id: job.id });
      } else if (job.render_state.waiting_blocks.length > 0) {
        // render_state is a huge object, frequent updates destroys db connection.
        // we chose to limit this state update to 10 times per render
        let last_save_percent = job.last_save_percent
          ? job.last_save_percent
          : job.metadata.rendered_pixel_count / job.metadata.pixel_count;
        const current_save_percent =
          job.render_state.finished_pixels.length / job.metadata.pixel_count;
        if (current_save_percent >= last_save_percent + 0.05) {
          saveProgressQueue.add(job);
          job.metadata.rendered_pixel_count =
            job.render_state.finished_pixels.length;
          job.last_save_percent = parseFloat(current_save_percent.toFixed(1));
          Logger.info({ event: "RENDER_STATE_SAVE_QUEUED", id: job.id });
        }
        Rendero.startRender(job, worker);
      }
    });

    worker.assignedBlocks = {};

    // if there are jobs in waitingRenderQueue
    // try to find a job with waiting blocks and assign the worker
    if (waitingRenderQueue.length > 0)
      for (const waitingRenderQueueElement of waitingRenderQueue) {
        if (waitingRenderQueueElement.render_state.waiting_blocks.length > 0)
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
          delete job.render_state.rendering_blocks[assignedBlockId];
          delete assignedBlock.jobId;
          job.render_state.waiting_blocks.push(assignedBlock);
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

var SceneService = require("../api/scene/v1/scene.service");
