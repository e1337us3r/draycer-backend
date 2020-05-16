const SceneRepository = require("./scene.repository");
const generateId = require("../../../utils/id.gen");

const SceneService = {
  async get(user_id, id) {
    return await SceneRepository.get(user_id, id);
  },
  async getAll(user_id) {
    return SceneRepository.getAll(user_id);
  },
  async create(user_id, scene) {
    const width = scene.WIDTH;
    const height = scene.HEIGHT;

    const timestamp = new Date().toISOString();

    const job = {
      user_id,
      id: generateId(),
      scene,
      created_at: timestamp,
      status: "waiting_workers",
      render_state: {
        waiting_blocks: [],
        rendering_blocks: {},
        finished_pixels: []
      },
      metadata: {
        rendered_pixel_count: 0,
        width,
        height,
        pixel_count: width * height
      }
    };

    job.render_state.waiting_blocks = Rendero.createRenderBlocks(height, width);

    if (Rendero.areWorkersAvailable()) {
      job.status = "rendering";
      job.started_at = timestamp;
    }

    Rendero.addRenderJobToQueue(job);

    return await SceneRepository.create(user_id, job);
  },
  async startJob(job) {
    let params = {};
    if (!job.started_at) {
      params = {
        started_at: new Date().toISOString(),
        status: "rendering"
      };
      await SceneRepository.update(job.user_id, job.id, params);
    }
    return { ...job, ...params };
  },
  async endJob(job, render) {
    let params = {};
    if (job.status === "rendering") {
      params = {
        ended_at: new Date().toISOString(),
        status: "completed",
        render
      };
      await SceneRepository.update(job.user_id, job.id, params);
    }

    return { ...job, params };
  },
  async pauseJob(user_id, id) {
    await SceneRepository.update(user_id, id, {
      status: "paused"
    });
    Rendero.removeJob(id);
  },
  async continueJob(user_id, id) {
    const job = await SceneRepository.updateAndReturn(user_id, id, {
      status: "rendering"
    });

    Rendero.addRenderJobToQueue(job);
  },
  async updateJobProgress(job) {
    const render_state = { ...job.render_state };
    render_state.waiting_blocks.push(
      Object.values(render_state.rendering_blocks)
    );
    render_state.rendering_blocks = {};
    await SceneRepository.update(job.user_id, job.id, {
      render_state: render_state,
      metadata: job.metadata,
      render: job.render
    });
  },
  async addAllJobsToQueue() {
    const jobs = await SceneRepository.getAllWithoutFilter();

    Rendero.addRenderJobsToQueue(jobs);
  }
};

module.exports = SceneService;

var Rendero = require("../../../core/rendero");
