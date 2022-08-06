const ApiError = require('../exceptions/app-error');

// этот мидле будет отвечать за обработку ошибок
module.exports = function(err, req, res, next){
    console.log(err);
    // проверяем создан ли экемляр класса 
    if (err instanceof ApiError){
        return res.status(err.status).json({massage: err.message, errors: err.errors})
    }
    return res.status(500).json({message: 'Непредвиденная ошибка'})
    
};
