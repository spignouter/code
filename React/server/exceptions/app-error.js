// ВОзвращает в экземпляры класса в ответ на вызов статик метода
// методы создают инстансы класса
module.exports = class ApiError extends Error{
    status;
    errors;

    constructor(status, message, errors = []){
        super(message);
        this.status = status;
        this.errors = errors;
    }

    //  возвращает экземпляр класса 
    static UnauthorizeError(){
        return new ApiError(401, 'Пользователь не авторизован');
    }

    static BadRequest(message, errors = []){
        return new ApiError(400, message, errors);
    }
}