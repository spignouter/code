// чтобы конроллер не был слишком толстым всю логику мы вынесем отдельно в так называемые сервисы

// сервис занимаеться предоставлением (получением) данных,  

//  понадобиться модель пользователя 
const UserModel = require('../models/user-model')

// хешируем пароль 
const bcrypt = require('bcrypt')
// ссылка по которой пользователь сможет подтвердить свой аккаунт
const uuid = require('uuid');

// теперь можем отправить пользователю письмо с ссылкой на почту пользователю для этого подключим маил сервис
const mailService = require('./mail-service');

//  генерируем тоекны сервиса
const tokenService = require('./token-service');

//  Импортируем DTO 
const UserDto = require('../dtos/user-dto');

// подключение 
const ApiError = require('../exceptions/app-error');

class UserService{
    //  функция для регистрации пользователя
    async registration(email, password){
    //  в первую очередь убеждаемся что в базе данных нет таких записей
    const condidate = await UserModel.findOne({email})
    if (condidate){
        throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
    }

    // хешируем пароль 
    const hashPassword = await bcrypt.hash(password, 3);
    //  активацпия пользователя, пользователь будет потдверждать что почта принадлежит ему
    //  функция должна вернуть уникальную строку  uuid.v4() возвращает рандомную строку
    const activationLink = uuid.v4();

    // Если пользователя с указанным именем и паролем нет то создаем пользователя
    const user = await UserModel.create({email, password:hashPassword, activationLink});
    // отправка письма пользователю для подтверждения почты
    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

    // на основании модели создадим объект для того что бы выкинуть не нужные поля
    const userDto = new UserDto(user);

    //  генерируем тоекны сервиса
    const tokens = tokenService.generateTokens({...userDto});

    //  рефреш токен сохроняем в базу данных
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    //  возрващаем данные
    return {...tokens, user: userDto}
}

//  функция активации, пользователя, для работы с базой необходимо создать модель базы хранимых данных (UserModel) 
    async activate(activationLink){
        const user = await UserModel.findOne({activationLink})
        if(!user){
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true;
        await user.save();
    }

    //  функция логина 
    async login(email, password){
        // ищем пользователя в базе денных
        const user = await UserModel.findOne({email})
        // Если не найден пользователь то возвращаем ошибку
        if(!user){
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        // Пользователь найден, необходимо сравнить пароли, первый отправленый пользоваетелем со вторым хронящимся в базе данных.
        const isPassEquals = await bcrypt.compare(password, user.password);
        // если пароли не совподают то 
        if(!isPassEquals){
            throw ApiError.BadRequest('Пароль неверный');
        }
        //  генерируем ДТО 
        const userDto = new UserDto(user);

        const tokens = tokenService.generateTokens({...userDto});
        // рефреш токен сохроняем в базе данных
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    //  возрващаем данные
    return {...tokens, user: userDto}
    }

    //  Функция logout будет вызвана из сервисов
    async logout(refreshToken){
        // удалить рефреш токен из базы данных, делаеться внутри tokenService 
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        // если пришел null или undefined то мы пробрасываем ошибку
        if(!refreshToken){
            throw ApiError.UnauthorizeError();
        }
        // валидация токена
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        // проверяем прошла ли валидация и найден ли токен, если нет то пользователь не авторизован
        if(!userData || !tokenFromDb){
            throw ApiError.UnauthorizeError();
        }
        // нужно обновить данные о пользователе делаеться это спомощью findById
        const user = await UserModel.findById(userData.id);
        // сгенирировать новый токен, функция generateTokens создает два токена 
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        // рефреш токен сохроняем в базе данных
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    //  возрващаем данные
    return {...tokens, user: userDto}
    }

    // эта функция доступна только зарегистрированому пользователю.

    // функция для получения всех пользователей
    async getAllUsers(){
        const users = await UserModel.find();
        return users;
    }

}
module.exports = new UserService();

// Запрос для регистрации пользователей
//Post запрос на адрес (маршрут, роутер) http://localhost:5000/api/registration
//Post запрос для функции login на адрес (маршрут, роутер) http://localhost:5000/api/login
// Тело для двух запросов одинаковое
//Body.raw.json
//{
//    "email": "spignouter@gmail.com",
//    "password": "1234"
//}
// Пороль обязательно должен быть строкой тоесть в скобках " "
// Иначе появляеться ошибка Error: data must be a string or Buffer and salt must either be a salt string or a number of rounds

// 


