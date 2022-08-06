// в котроллере находяться модели данных которые он получает из сервисов
const userService = require("../service/user-service");

// В контроллере получаем реультат валидации
const{validationResult} = require('express-validator');

// обработка ошибок
const ApiError = require('../exceptions/app-error');

// есть адреса (маршруты) в папки router, тепрь нужно зделать функции которые будут вызываться по запросу адреса (мршрута)
// Также отлавливет ожибки в коде так называемая чистота кода. 
class UserController {
    async registration(req, res, next){
        try{
            // валидация
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, password} = req.body;
            const userDate = await userService.registration(email, password);
                        
            //  добовления рефреш токина в куки браузера
            res.cookie('refreshToken', userDate.refreshToken, {maxAge: 30 *24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userDate);
        }catch(e){
            next(e);
        }
    }
    
    //  из запроса вытаскиваем логин и пароль, 
    async login(req, res, next){
        try{
            const {email, password} = req.body;
            const userDate = await userService.login(email, password);
            //  добовления рефреш токина в куки браузера
            res.cookie('refreshToken', userDate.refreshToken, {maxAge: 30 *24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userDate);

        }catch(e){
            next(e);
        }
    }

    async logout(req, res, next){
        try{
            // Из куки достаем рефреш токен
            const {refreshToken} = req.cookies;
            // передаем рефреш токен сервису функции logout
            const token = await userService.logout(refreshToken);
            // необходимо удалить куки с рефрештокеном
            res.clearCookie("refreshToken");
            // возвращаем ответ на клиент
            return res.json(token);
        }catch(e){
            next(e);
        }
    }
    
    //  из строки запроса req получаем ссылку .params.link; 
    async activate(req, res, next){
        try{
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            // переадресация на другой хост 
            return res.redirect(process.env.CLIENT_URL);
        }catch(e){
            next(e);
        }
    }
    // обновление сеанса пользователя, перезапись покена
    async refresh(req, res, next){
        try{
            //  из куки достаём рефреш токен
            const {refreshToken} = req.cookies;
            const userDate = await userService.refresh(refreshToken);
            //  добовления рефреш токина в куки браузера
            res.cookie('refreshToken', userDate.refreshToken, {maxAge: 30 *24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userDate);
        }catch(e){
            next(e);
        }
    }

    async getUsers(req, res, next){
        try{
            const users = await userService.getAllUsers();
            return res.json(users);
        }catch(e){
            next(e);
        }
    }
}

module.exports = new UserController();

