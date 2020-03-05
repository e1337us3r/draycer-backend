const Rendero = require("../../../core/rendero");
const scenes = [];

const SceneRepository = {
  async getAll(user_id) {
    const results = scenes.filter(scene => scene.user_id === user_id);

    return { results, count: results.length };
  },
  async get(user_id, id) {
    for (const scene of scenes)
      if (scene.id === id && scene.user_id === user_id) {
        const job = Rendero.getRenderJob(id);

        scene.status = job.status;

        return {
          ...scene,
          render: job.render,
          renderedPixelCount: job.renderedPixelCount
        };
      }

    return {};
  },
  async create(user_id, sceneObj) {
    const scene = {
      id: Date.now().toString(),
      user_id,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      updated_at: null,
      ended_at: null,
      status: "created",
      render: null
    };

    scenes.push(scene);

    Rendero.addRenderJob(scene.id, sceneObj);

    return scene;
  }
};

module.exports = SceneRepository;
