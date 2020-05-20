const db = require("../../../db");

const UserRepository = {
  async getWorkRecords(user_id) {
    const results = await db("work_record")
      .where({ user_id })
      .select("*")
      .orderBy("last_render_at", "desc");

    return { results, count: results.length };
  },
  async saveWorkProgress(user_id, job_id, last_block_id) {
    await db.raw(
      `
      INSERT INTO work_record (job_id, user_id,  last_render_at, last_block_id )
      VALUES
      (
        :job_id,
        :user_id,
        :last_render_at,
        :last_block_id
      )
      ON CONFLICT ON CONSTRAINT work_record_primary_key
      DO
      UPDATE 
      SET rendered_block_count = work_record.rendered_block_count + 1, 
      last_render_at = :last_render_at, 
      last_block_id = :last_block_id
    `,
      {
        job_id,
        user_id,
        last_render_at: new Date().toISOString(),
        last_block_id
      }
    );
  }
};

module.exports = UserRepository;
