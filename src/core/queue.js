const Queue = require("bull");
const CONFIG = require("./config");
const createPNG = require("../utils/createPNG");
const SceneService = require("../api/scene/v1/scene.service");
const UserService = require("../api/user/v1/user.service");
const Logger = require("./logger");

const saveProgressQueue = new Queue("saveProgressQueue", CONFIG.redisUri);
const saveWorkRecordQueue = new Queue("saveWorkRecordQueue", CONFIG.redisUri);

saveProgressQueue.process(function(params) {
  return new Promise((resolve, reject) => {
    (async () => {
      const job = params.data;
      const png = await createPNG(job);
      job.render = png;

      if (
        job.render_state.waiting_blocks.length === 0 &&
        Object.keys(job.render_state.rendering_blocks).length === 0
      ) {
        await SceneService.endJob(job, png);
        Logger.info({ event: "RENDER_RESULT_SAVED", id: job.id });
      } else {
        await SceneService.updateJobProgress(job);
        Logger.info({ event: "RENDER_STATE_SAVED", id: job.id });
      }

      resolve();
    })();
  });
});

saveWorkRecordQueue.process(function(params) {
  return new Promise((resolve, reject) => {
    (async () => {
      const { user_id, job_id, last_block_id } = params.data;
      await UserService.saveWorkProgress(user_id, job_id, last_block_id);

      resolve();
    })();
  });
});

module.exports = { saveProgressQueue, saveWorkRecordQueue };
