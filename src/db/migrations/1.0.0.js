exports.up = function(knex, Promise) {
  return knex.schema.createTable("job", table => {
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
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("job");
};
