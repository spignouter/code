require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware');



const PORT = process.env.PORT || 5000;
const app = express()

// простая демонстация работы мидлваров пример
const myLogger = function(req, res, next){
    console.log('LOGGED')
    next()
    }

app.use(express.json()); //middleware валидация
app.use(cookieParser()); //middleware
app.use(cors()); //для взаимодействия с сервером из браузера
app.use('/api', router); // вызов маршрута

// простой пример работы HTML запросов пример
//app.use(myLogger);

// мидлеверы для обработки ошибок должны идти вконце всех остальных мидлеверов.
app.use(errorMiddleware);

// ответ на адрес в строке пример
app.get('/', (req, res)=>
res.send("Hellow World")
);


const start = async ()=>{
    try{
        app.listen(PORT, ()=> console.log("Server started on PORT =", PORT))

        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(()=> console.log('MongoDB has started...'))
        .catch(e => console.log(e))



    }catch(e){
        console.log(e);
    }
}

start();