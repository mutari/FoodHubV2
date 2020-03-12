require('dotenv').config();
const express = require('express');
const mongodb = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');

const foodRouter = require('./routes/FoodRoutes');
const userRouter = require('./routes/UserRoutes');

const logedin = require('./modules/IsUserLogedIn');

(async () => {

    //connect db
    const con = await mongodb.connect(process.env.CONSTRING, {useNewUrlParser: true, useUnifiedTopology: true});
    
    const db = await con.db('menu');
    const foodCol = await db.collection('food');
    const userCol = await db.collection('user');

    const app = express();

    app.set('view engine', 'pug');
    app.use(express.static(__dirname + '/public'));
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser());

    //lägger till db col i req för att man ska komma åt objekten över allt
    app.use((req, res, next) => {
        req.dbFood = foodCol; req.dbUser = userCol; next();
    })

    app.use(logedin);
    app.use('/', foodRouter);
    app.use('/', userRouter);
    

    app.listen(process.env.PORT, (err) => {
        if(err) console.log(err);
        else console.log(`server started an runing on port: ${process.env.PORT}`);
    });

})();