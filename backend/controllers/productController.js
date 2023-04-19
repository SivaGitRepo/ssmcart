const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const APIFeatures = require('../utils/apiFeatures');

//Get products - api/v1/products
exports.getProducts = async (req, res, next) => {
    const resultsPerPage = 2;
    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(resultsPerPage);
    const products = await apiFeatures.query;
    //return next(new ErrorHandler('Unable to loaddddd', 500));  
    res.status(200).json({
        success:true,
        count: products.length,
        products: products
    })
}

//Get single product - api/v1/product
exports.getProduct = catchAsyncError (async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
            return next(new ErrorHandler('Product not found..!', 400));
        }
        //await new Promise(resolve => setTimeout(resolve, 3000));
        res.status(201).json({
            success:true,
            product: product
        })
    }
)

//Create product - api/v1/product/new
exports.newProduct = catchAsyncError (async (req, res, next) => {
    
    req.body.user = req.user.id;

    const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        product: product
    })
});

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

//Create / Update user review
exports.createReview = catchAsyncError(async (req, res, next) => {
    const { productId, rating, comment } = req.body;

    const review = {
        user: req.user.id,
        rating: rating,
        comment: comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(review => {
        return review.user.toString() == req.user.id.toString()
    })

    //if user had already reviewed the product, update it; else create new review    
    if (isReviewed){
        product.reviews.forEach(review => {
            if (review.user.toString() == req.user.id.toString()){
                review.comment = comment
                review.rating = rating
            }
        })
    }else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    //calculate average rating for the product
    product.ratings = product.reviews.reduce((acc, review) => {
        return review.rating + acc
    }, 0) / product.reviews.length;

    product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })
})

//Get product reviews
exports.getReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

exports.deleteReview = catchAsyncError(async (req,res, next) => {
    const product = await Product.findById(req.query.productId);

    //remove the review to be deleted, by filtering it out from the DB, the flitered data will then replace the DB data thus 'deleting' the input review
    const reviews = product.reviews.filter(review => {
        return review._id.toString() !== req.query.id.toString()
    });

    const numOfReviews = reviews.length;
    let ratings = reviews.reduce((acc, review) => {
        return review.rating + acc
    }, 0) / reviews.length;

    ratings = isNaN(ratings) ? 0 : ratings;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews: reviews,
        numOfReviews: numOfReviews,
        ratings: ratings
    })

    res.status(200).json({
        success: true
    })
})