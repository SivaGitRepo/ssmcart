const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const sendToken = require('../utils/jwt');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

exports.registerUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password, avatar, role} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar,
        role
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

exports.getUserProfile = catchAsyncError (async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user: user
  })
})

exports.changePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  //validate old password entered by user
  if (! await user.isValidPassword(req.body.oldPassword)) {
    return next(new ErrorHandler('Invalid old password', 401))
  }

  //store new password entered by user
  user.password = req.body.password;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password successfully changed!'
  })
})

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true  
  })

  res.status(200).json({
    success: true,
    user: user
  })
})

//admin panel - get all users
exports.getUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users: users
  })
})

//admin panel - get single user
exports.getUser = catchAsyncError (async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next (new ErrorHandler('User not found', 400))
  }
  res.status(200).json({
    success: true,
    user: user
  })
})

//admin panel - update user details
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    user: user
  })
})

//admin panel - delete user details
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted'
  })
})