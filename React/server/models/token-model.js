//  схема хранения рефреш токина пользователя
// данная схема представляет модель документа (данных) которые храняться в коллекции.
const {Schema, model} =  require('mongoose');

const TokenSchema  = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    refreshToken: {type: String,  require: true},
})

module.exports = model('Token', TokenSchema);