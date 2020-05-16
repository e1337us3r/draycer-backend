exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("job", table => {
      table.string("id").primary();
      table.string("user_id").notNullable();
      table.timestamps(true, true);
      table.timestamp("started_at");
      table.timestamp("ended_at");
      table.string("status");
      table.text("render");
      table.jsonb("scene");
      table.jsonb("metadata");
      table.jsonb("render_state");
    })
    .createTable("work_record", table => {
      table.string("job_id");
      table.string("user_id");
      table.integer("rendered_block_count").defaultTo(0);
      table.timestamp("last_render_at");
      table.string("last_block_id");
      table.primary(["job_id", "user_id"], "work_record_primary_key");
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("job").dropTable("job");
};
