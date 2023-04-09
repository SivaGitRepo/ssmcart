const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const sendToken = require('../utils/jwt');
const sendEmail = require('../utils/email');
const crypto = require('crypto')

exports.registerUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password, avatar} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    sendToken(user, 201, res);
})

exports.loginUser = catchAsyncError(async (req, res, next) => {
    const {email, password}   = req.body;

    if (!email || !password) {
      return next (new ErrorHandler('Please enter email & password',400));
    }
    //find entered credentials in database
    const user = await User.findOne({email}).select('+password');
    
    if (!user) {
      return next (new ErrorHandler('Invalid email or password',401));
    }
    
    if (!await user.isValidPassword(password)) {
      return next (new ErrorHandler('Invalid email or password',401));
    }
    
    sendToken(user, 201, res);

})

exports.logoutUser = (req, res, next) => {
    res.cookie('token', null, {
      expires: new Date (Date.now()),
      httpOnly: true
  })
  .status(200)
  .json({
      success: true,
      message: 'Logged out!'
  })
}

exports.forgotPassword = catchAsyncError( async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if ( !user ) {
        return next (new ErrorHandler('User not found with this email', 404));
      }
    
    const resetToken = user.getResetToken();
    await user.save({validateBeforeSave: false})
    
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`
    
    const message = `Your password reset URL is as follows: \n\n
    ${resetUrl} \n\n Please ignore if you have not requested this`
    
    try {
      sendEmail({
        email: user.email,
        subject: 'SSMcart password recovery',
        message: message
      })
      
      res.status(200).json({
        success: true,
        message: `e-mail sent to ${user.email}`
      })
    }catch (error) {
      user.resetPasswordToken = undefined;
      user.restPasswordTokenExpire = undefined;
      await user.save({validateBeforeSave: false});
      return next(new ErrorHandler(error.message), 500);
    }
})

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  console.log(resetPasswordToken)
  const user = await User.findOne( {
    resetPasswordToken,
    restPasswordTokenExpire: {
      $gt: Date.now()
    }
  } )

  if (!user) {
    return next (new ErrorHandler ('Password reset token is invalid or expired'));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next (new ErrorHandler('Password does not match'));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.restPasswordTokenExpire = undefined;
  await user.save({validateBeforeSave: false});

  sendToken(user, 201, res);

})