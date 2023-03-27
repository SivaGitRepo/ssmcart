const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');

//Get products - api/v1/products
exports.getProducts = async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({
        success:true,
        count: products.length,
        products: products
    })
}

//Get single product - api/v1/product
exports.getProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler('Product not found..!', 400));
    }
    res.status(201).json({
        success:true,
        product: product
    })
}

//Create product - api/v1/product/new
exports.newProduct = async (req, res, next) => {
    const product = await Product.create(req.body);
    console.log(res);
    res.status(201).json({
        success:true,
        product: product
    })
}

//Update product - api/v1/product/:id

exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    console.log(req.body);
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    
    res.status(200).json({
        success: true,
        product: product
    })
}

// Delete a product - api/vi/product/:id
exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found!'
        })
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Product deleted!"
    })
}