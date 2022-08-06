// чтобы конроллер не был слишком толстым всю логику мы вынесем отдельно в так называемые сервисы
const jwt = require('jsonwebtoken');

//  модель для сохранения рефреш токена в базе данных для конкретного пользователя
const tokenModel = require('../models/token-model')

// генерирует два токина токен доступа и токен рефреша
class TokenService{
    // функция генерирует два токена, payload - данные которые вшиваються в токен 
    generateTokens(payload){
        //  в общем то токен доступа  
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn:'30s'});
        //  токен рефреша 
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn:'30d'});
        return {
            accessToken,
            refreshToken,
        }
    }

    // волидация токена, убедиться что он не потделан и что у него срок годности не иссяк
    validateAccessToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch(e){
            return null;
        }
    }

    validateRefreshToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch(e){
            return null;
        }
    }

    // функция для сохранения токена для пользователя
    async saveToken(userId, refreshToken){

        // findOne метод работающий с базой данных MongoDB,
        // findOne метод который находит в данныы в коллекции
        // сначала проверяем есть ли в базе данных данный пользователь
        const tokenData = await tokenModel.findOne({user:userId});
        // если что то нашли перезаписываем токен
        if(tokenData){
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        //  если ни чего не нашли то создаем запись в базе данных о пользователе и его токене
        const token = await tokenModel.create({user: userId})
        // возврещаем токен
        return token;
    }

    // создаём функцию удаления токена
    async removeToken(refreshToken){
        // обрщаемся к tokenModel и у нее вызываем функцию deleteOne, тоесть будет найдена запись и удалена
        const tokenData = await tokenModel.deleteOne({refreshToken})
        //  сама запись из базы данных вернеться
        return tokenData;
    }

    // создаём функцию которая ищет рефрештокен в базе данных
    async findToken(refreshToken){
        // обрщаемся к tokenModel и у нее вызываем функцию findOne, тоесть будет найдена
        const tokenData = await tokenModel.findOne({refreshToken})
        //  сама запись из базы данных вернеться
        return tokenData;
    }

}

module.exports = new TokenService();
