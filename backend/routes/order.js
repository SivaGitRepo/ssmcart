const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate')
const { newOrder, getOrder, myOrders, getOrders, updateOrder, deleteOrder } = require('../controllers/orderController');

router.route('/order/new').post(isAuthenticatedUser, newOrder);
router.route('/order/:id').get(isAuthenticatedUser, getOrder);
router.route('/myorders').get(isAuthenticatedUser, myOrders);

//admin routes
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), getOrders)
router.route('/admin/order/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
                                .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;