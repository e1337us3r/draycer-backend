const db = require("../../../db");

const SceneRepository = {
  async getAll(user_id) {
    /*
    user_id,
      id: generateId(),
      scene,
      created_at: timestamp,
      status: "waiting_workers",
      render_state: {
        rendered_pixel_count: 0,
        waiting_blocks: [],
        rendering_blocks: {},
        finished_pixels: []
      },
      metadata: {
        width,
        height,
        pixel_count: width * height
      }
    * */
    const results = await db("job")
      .where({ user_id })
      .select(
        "id",
        "status",
        "created_at",
        "started_at",
        "ended_at",
        "metadata"
      );

    return { results, count: results.length };
  },
  getAllWithoutFilter() {
    return db("job")
      .select("*")
      .where({ status: "rendering" })
      .orWhere({ status: "waiting_workers" });
  },
  async get(user_id, id) {
    return db("job")
      .where({ user_id, id })
      .select(
        "id",
        "status",
        "created_at",
        "started_at",
        "ended_at",
        "metadata",
        "render",
        "scene"
      )
      .first();
  },
  async create(user_id, job) {
    await db("job").insert(job);

    return job;
  },
  async updateAndReturn(user_id, id, params) {
    return db("job")
      .where({ user_id, id })
      .update(params)
      .returning("*")
      .first();
  },
  async update(user_id, id, params) {
    return db("job")
      .where({ user_id, id })
      .update(params)
      .timeout(300000);
  }
};

module.exports = SceneRepository;
