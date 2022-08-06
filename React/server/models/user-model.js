const {Schema, model} =  require('mongoose'); // схема и модель  

//  сосдаем схему, какие поля имеет сущность пользователя
const UserSchema = new Schema({
    email: {type: String, unique: true, require: true},
    password: {type: String,  require: true},
    isActivated: {type: Boolean, default: false},   
    activationLink: {type: String},
})

// експорт схемы 
module.exports = model('User', UserSchema); 