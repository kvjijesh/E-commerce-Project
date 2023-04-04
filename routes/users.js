const express = require("express");
const router = express.Router();
const profile = require("../controllers/user_controller/profile");
const productController = require("../controllers/product_controller/productController");
const orderController = require("../controllers/order_controller/orderController");
// const auth = require("../middlewares/auth");
const userLogin = require("../controllers/user_controller/login_user");
const cart = require("../controllers/user_controller/cart");
const address = require("../controllers/user_controller/address");
const {isLogin,isLogout,isBlocked}=require('../middlewares/auth')
/* GET home page. */
router.get("/", profile.loadHome);
router.get("/home", isLogin,isBlocked, profile.loadHome);
router.get("/signup", isLogout, userLogin.loadSignup);
router.post("/signup",isLogout, userLogin.createUser);
router.get("/login", isLogout, userLogin.loadLogin);
router.post("/login",isLogout, userLogin.verifyLogin);
router.get("/logout", isLogin, userLogin.userLogout);
router.post("/verifyOtp",isLogout ,userLogin.otpsubmit);
router.get("/product", productController.userproductload);
router.get("/product-detail", productController.productDetailLoad);

router.get("/cat", productController.womenProductLoad);
router.get("/cat", productController.menProductLoad);
router.get("/profile", isLogin,isBlocked, profile.profileLoad);
router.get("/address", isLogin,isBlocked, address.adressLoad);
router.get("/add-address", isLogin,isBlocked, address.addAdressLoad);
router.post("/add-address",isLogin,isBlocked ,address.addAddress);
router.get("/edit-user", isLogin,isBlocked, profile.editUserPage);
router.post("/edit-user",isLogin,isBlocked, profile.editUserpost);

router.get("/edit-address", isLogin,isBlocked, address.editAddress);
router.post("/edit-address",isLogin,isBlocked ,address.editAddresspost);
router.post("/product-detail", isLogin,isBlocked,cart.addToCart);
router.get("/cart", isLogin,isBlocked, cart.viewCart);
router.get("/delete", isLogin,isBlocked, profile.deleteUser);
router.get("/forget", isLogout, userLogin.forgetLoad);
router.post("/forget", isLogout,userLogin.forgetPostOtp);
router.post("/forgetOtpVerify",isLogout,userLogin.forgetOtpVerify);
router.post("/resetPassword",isLogout,userLogin.resetPassword);
router.get("/remove", isLogin,isBlocked, cart.removeCart);
router.get("/checkout", isLogin,isBlocked, orderController.checkoutPage);

router.post("/order-summary",isLogin,isBlocked, orderController.orderSummary);
router.get("/view-order", isLogin,isBlocked, orderController.viewOrders);
router.get("/payments", isLogin,isBlocked, orderController.paymentLoad);
router.post("/payments/create-order",isLogin,isBlocked, orderController.payment);
router.post("/payments/verify", isLogin,isBlocked,orderController.verifyPayment);
router.get("/order-success", isLogin,isBlocked, orderController.orderSuccess);
router.get("/order-details", isLogin,isBlocked, orderController.orderDetails);
router.post("/update-cart",isLogin,isBlocked, cart.cartUpdation);
router.put("/orders/:orderId/cancel",isLogin,isBlocked, orderController.cancellOrder);
router.put("/orders/:orderId/return",isLogin,isBlocked, orderController.returnOrder);
router.post("/coupon-apply", isLogin,isBlocked,orderController.couponApply);
router.get("/past-orders", isLogin,isBlocked, orderController.pastOrder);
router.get("/invoice/:orderId",isLogin, orderController.invoicedown);
router.get("/search", productController.productsearch);
router.get("/add-checkoutaddress", isLogin,isBlocked, address.addAdressLoad);
router.post("/add-checkoutaddress", isLogin,isBlocked, address.checkoutsaveaddress);

module.exports = router;
