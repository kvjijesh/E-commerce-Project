const express = require("express");
const router = express.Router();
const profile = require("../controllers/user_controller/profile");
const productController = require("../controllers/product_controller/productController");
const orderController = require("../controllers/order_controller/orderController");
const auth = require("../middlewares/auth");
const userLogin = require("../controllers/user_controller/login_user");
const cart = require("../controllers/user_controller/cart");
const address = require("../controllers/user_controller/address");

/* GET home page. */
router.get("/", profile.loadHome);
router.get("/home", auth.isLogin, profile.loadHome);
router.get("/signup", auth.isLogout, userLogin.loadSignup);
router.post("/signup",auth.isLogout, userLogin.createUser);
router.get("/login", auth.isLogout, userLogin.loadLogin);
router.post("/login",auth.isLogout, userLogin.verifyLogin);
router.get("/logout", auth.isLogin, userLogin.userLogout);
router.post("/verifyOtp",auth.isLogout ,userLogin.otpsubmit);
router.get("/product", productController.userproductload);
router.get("/product-detail", productController.productDetailLoad);
//router.get('/:id',productController.productDetailLoad)
router.get("/cat", productController.womenProductLoad);
router.get("/cat", productController.menProductLoad);
router.get("/profile", auth.isLogin, profile.profileLoad);
router.get("/address", auth.isLogin, address.adressLoad);
router.get("/add-address", auth.isLogin, address.addAdressLoad);
router.post("/add-address",auth.isLogin ,address.addAddress);
router.get("/edit-user", auth.isLogin, profile.editUserPage);
router.post("/edit-user",auth.isLogin, profile.editUserpost);

router.get("/edit-address", auth.isLogin, address.editAddress);
router.post("/edit-address",auth.isLogin ,address.editAddresspost);
router.post("/product-detail", auth.isLogin,cart.addToCart);
router.get("/cart", auth.isLogin, cart.viewCart);
router.get("/delete", auth.isLogin, profile.deleteUser);
router.get("/forget", auth.isLogout, userLogin.forgetLoad);
router.post("/forget", auth.isLogout,userLogin.forgetPostOtp);
router.post("/forgetOtpVerify", auth.isLogout,userLogin.forgetOtpVerify);
router.post("/resetPassword", auth.isLogout,userLogin.resetPassword);
router.get("/remove", auth.isLogin, cart.removeCart);
router.get("/checkout", auth.isLogin, orderController.checkoutPage);

router.post("/order-summary",auth.isLogin, orderController.orderSummary);
router.get("/view-order", auth.isLogin, orderController.viewOrders);
router.get("/payments", auth.isLogin, orderController.paymentLoad);
router.post("/payments/create-order",auth.isLogin, orderController.payment);
router.post("/payments/verify", auth.isLogin,orderController.verifyPayment);
router.get("/order-success", auth.isLogin, orderController.orderSuccess);
router.get("/order-details", auth.isLogin, orderController.orderDetails);
router.post("/update-cart",auth.isLogin, cart.cartUpdation);
router.put("/orders/:orderId/cancel",auth.isLogin, orderController.cancellOrder);
router.put("/orders/:orderId/return",auth.isLogin, orderController.returnOrder);
router.post("/coupon-apply", auth.isLogin,orderController.couponApply);
router.get("/past-orders", auth.isLogin, orderController.pastOrder);
router.get("/invoice/:orderId", auth.isLogin, orderController.invoicedown);
router.get("/search", productController.productsearch);
router.get("/add-checkoutaddress", auth.isLogin, address.addAdressLoad);
router.post("/add-checkoutaddress", auth.isLogin, address.checkoutsaveaddress);

module.exports = router;
