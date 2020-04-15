const ObjectID = require('mongodb').ObjectID;
const jimp = require('jimp');

module.exports = {

    index: async (req, res) => {
        var maxOnSide = req.query.maxside || 6;
        var sida = 0;
        try {
            //bestämmer hur många som ska levereras
            if(req.query.side) {
                if(sida < 0) sida = 0;
                var food = await req.dbFood.find().skip(maxOnSide*req.query.side).limit(maxOnSide).toArray(); //hemtar alla maträtter i från databasen
            }
            else
                var food = await req.dbFood.find().toArray();
            
            const user = await req.dbUser.findOne({"email": req.token.email}); //hämtar den profilen som är inlågad

            res.render('index', {items: food, logedIn: req.token.username, profile: user, side: req.query.side, maxside: 100});
        } catch (err) {console.log(`Somthing whent wrong, route: index, msg: ${err}`);}
    },

    //renderar en sorterad veriation av index
    sort: async (req, res) => {
        try {
            const food = await req.dbFood.find({tag: req.body.search}).toArray();
            console.log(food);

            const user = await req.dbUser.findOne({"email": req.token.email});

            res.render('index', {items: food, logedIn: req.token.username, profile: user});
        } catch (err) {console.log(`Somthing whent wrong, route: sort, msg: ${err}`);}
    },

    //get routes (routes som levererar något)
    getFoodById: async (req, res) => {

        try {
            let obj = await req.dbFood.findOne({"_id": ObjectID(req.params.id)});
            res.render('FoodInfo', {...obj, logedIn: req.token.username});
        } catch (err) {console.log(`Somthing whent wrong, route: getFoodById, msg: ${err}`);}

    },

    renderCreateFood: (req, res) => {
        res.render('addFood', {logedIn: req.token.username});
    },

    createFood: async (req, res) => {
        try {
            if(req.files.image) {
                let imgname = Date.now()+".jpg"
                let imgaddres = require('path').join(__dirname, "/..", "/images/", imgname);
                req.files.image.mv(imgaddres);
                jimp.read(imgaddres, (err, image) => {
                    if(err) throw err
                    image.resize(256, jimp.AUTO);
                })
                req.body.image = '/image/' + imgname;
            } else // om användaren inte laddat upp en bild hämts en random bild
                req.body.image = "https://source.unsplash.com/298x223/?food&sig=" + parseInt(Math.random()*100000000);
            
            //sparar all info man behöver i body för att sedan skicka body objektet till servern
            req.body.user = req.token;

            let d = new Date();
            req.body.time = d.toUTCString();
            var delEmpty = e => e != '' || e != ' ' //tar bort items som är tomma  
            if(Array.isArray(req.body.howto)) req.body.howto = req.body.howto.filter(delEmpty);
            if(Array.isArray(req.body.tag)) req.body.tag = req.body.tag.filter(delEmpty);
            if(Array.isArray(req.body.ingridient)) req.body.ingridient = req.body.ingridient.filter(delEmpty);

            await req.dbFood.insertOne(req.body);
            res.redirect('/');
        } catch (err) {console.log(`Somthing whent wrong, route: createFood, msg: ${err}`);}
    },

    deleteFood: async (req, res) => {
        try {
            await req.dbFood.deleteOne({"_id": ObjectID(req.params.id)});
            res.redirect('/profile');
        } catch (err) {console.log(`Somthing whent wrong, route: deleteFood, msg: ${err}`);}
    },

    renderRewriteFood: async (req, res) => {
        try {
            let data = await req.dbFood.findOne({"_id": ObjectID(req.params.id)});
            res.render('rewriteFood', {...data, logedIn: req.token.username});
        } catch (err) {console.log(`Somthing whent wrong, route: renderRewriteFood, msg: ${err}`);}
    },

    rewriteFood: async (req, res) => {
        try {
            await req.dbFood.updateOne({"_id": ObjectID(req.params.id)}, {$set: req.body});
            res.redirect('/');
        } catch (err) {console.log(`Somthing whent wrong, route: rewriteFood, msg: ${err}`);}

    }

}