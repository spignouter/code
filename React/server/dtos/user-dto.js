// информация о пользователе для генерации токенов 
// это некий класс который облодаеет некоторыми полями который мы будем отпровлять на клиентн
// data transfer object 

module.exports = class UserDto{
    email;
    id;
    isActivated;

    constructor(model){
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
    }
}