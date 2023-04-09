const express = require('express');
const { getProducts, newProduct, getProduct, updateProduct, deleteProduct, createReview, getReviews, deleteReview } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/products').get(isAuthenticatedUser, getProducts);
router.route('/product/:id').get(getProduct)
                            .put(updateProduct)
                            .delete(deleteProduct);
router.route('/review').put(isAuthenticatedUser, createReview)
                       .get(isAuthenticatedUser, getReviews)
                       .delete(isAuthenticatedUser, deleteReview);

//Admin routes
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

module.exports = router;