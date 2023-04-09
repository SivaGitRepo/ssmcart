const catchAsyncError = require('../middlewares/catchAsyncError');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');

//Create order
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const { orderItems, 
            shippingInfo, 
            itemsPrice, 
            taxPrice, 
            shippingPrice, 
            totalPrice, 
            paymentInfo } = req.body;

    const order = await Order.create({
        orderItems, 
        shippingInfo, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice, 
        paymentInfo,
        paidOn: Date.now(),
        user: req.user.id
    })

    res.status(200).json({
        success: true,
        order: order
    })
})

//Get single order
exports.getOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate ({path:'user', model:'User', select: 'name email'});

    if (!order) {
        return next (new ErrorHandler(`Order not found with this id ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        order: order
    })
})

//Get orders connected to user logged in
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({user: req.user.id});

    res.status(200).json({
        success: true,
        orders: orders
    })
})

//Admin - Get all orders
exports.getOrders = catchAsyncError(async(req, res, next) => {
    const orders = await Order.find();
    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount: totalAmount,
        orders: orders
    })
})

//Admin Update order
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus == 'Delivered') {
        return next(new ErrorHandler('Order has been already delivered', 400));
    }

    //updating product stock of each item in the order
    order.orderItems.forEach(async orderItem => {
        await updateStock(orderItem.product, orderItem.quantity)
    })

    order.orderStatus = req.body.orderStatus;
    order.deliveredOn = Date.now();
    await order.save();

    res.status(200).json({
        success: true

    })
})

async function updateStock (productId, quantity) {
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    product.save({validateBeforeSave: false});
}

//Admin - Delete order
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
        success: true,
        message: 'Order deleted'
    })
})