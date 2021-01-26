const mongoose = require('mongoose');
let PB2CacheSchema = new mongoose.Schema({
    mainPB2Login: {
        type: String,
        unique: true
    },
    firstBotInteraction: Date,
    PB2ProfileCache: { }
  });
const PB2Cache = mongoose.model('PB2Cache', PB2CacheSchema);

module.exports = {
    PB2Cache
    };