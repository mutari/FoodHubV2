const express = require('express');
const router = express.Router();

const controllers = require('../controllers/FoodController');
const auth = require('../modules/UserAuth');

router.get('/', controllers.index);
router.post('/sort', controllers.sort);
router.get('/get/:id', controllers.getFoodById);

router.get('/create/food', auth, controllers.renderCreateFood);
router.post('/create/food', auth, controllers.createFood);

router.get('/rewrite/food/:id', auth, controllers.renderRewriteFood);
router.post('/rewrite/food/:id', auth, controllers.rewriteFood);

module.exports = router;