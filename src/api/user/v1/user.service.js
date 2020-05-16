const UserRepository = require("./user.repository");

const UserService = {
  async create() {},
  async getWorkRecords(user_id) {
    return UserRepository.getWorkRecords(user_id);
  },
  async saveWorkProgress(user_id, job_id, last_block_id) {
    await UserRepository.saveWorkProgress(user_id, job_id, last_block_id);
  }
};

module.exports = UserService;
