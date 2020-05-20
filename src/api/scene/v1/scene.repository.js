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
      )
      .orderBy("created_at", "desc");

    return { results, count: results.length };
  },
  getAllWithoutFilter() {
    return db("job")
      .select("*")
      .where({ status: "rendering" })
      .orWhere({ status: "waiting_workers" });
  },
  async get(id, selectScene) {
    const columns = [
      "id",
      "status",
      "created_at",
      "started_at",
      "ended_at",
      "metadata",
      "render"
    ];
    if (selectScene) columns.push("scene");
    return db("job")
      .where({ id })
      .select(columns)
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
      .returning("*");
  },
  async update(user_id, id, params) {
    return db("job")
      .where({ user_id, id })
      .update(params)
      .timeout(300000);
  },
  async getWorkRecords(user_id, id) {
    const results = await db("work_record")
      .where({ job_id: id, user_id })
      .select("*");

    return { results, count: results.length };
  }
};

module.exports = SceneRepository;
