const db = require("../../../db");

const SceneRepository = {
  async getAll(user_id) {
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
