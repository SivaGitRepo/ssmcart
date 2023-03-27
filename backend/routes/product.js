const express = require('express');
const { getProducts, newProduct, getProduct, updateProduct } = require('../controllers/productController');
const router = express.Router();

router.route('/products').get(getProducts);
router.route('/product/new').post(newProduct);
router.route('/product/:id').get(getProduct)
                            .put(updateProduct);

module.exports = router;