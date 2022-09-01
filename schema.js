const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  guildId: String,
  guildChannel: String,
  connectionChannel: String
});

module.exports = mongoose.model("connections", guildSchema);