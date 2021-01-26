const mongoose = require('mongoose');
let PB2UserSchema = new mongoose.Schema({
    discordUserID:  {
        type: String,
        unique: true
    }, // String is shorthand for {type: String}
    mainPB2Login: {
        type: String,
        unique: true
    },
    otherLinkedPB2Accs:   [String],
    removedLinkedPB2Accs: [String],
    likes:   [String],
    dislikes:   [String],
    firstBotInteraction: Date,
    PB2ProfileCache: { }
  });
const PB2User = mongoose.model('PB2User', PB2UserSchema);

module.exports = {
    PB2User
    };