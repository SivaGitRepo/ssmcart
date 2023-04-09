const express = require('express');
const { registerUser, 
        loginUser, 
        logoutUser, 
        forgotPassword, 
        resetPassword, 
        changePassword, 
        getUserProfile, 
        updateProfile,
        getUsers,
        getUser,
        updateUser,
        deleteUser} = require('../controllers/authController');
const { isAuthenticatedUser, 
        authorizeRoles } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/myprofile').get(isAuthenticatedUser, getUserProfile)
router.route('/password/change').put(isAuthenticatedUser, changePassword);
router.route('/myprofile/update').put(isAuthenticatedUser, updateProfile);

//Admin routes
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles('admin'), getUser)
                               .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
                               .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;