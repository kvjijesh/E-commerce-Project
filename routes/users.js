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
router.post("/signup", userLogin.createUser);
router.get("/login", auth.isLogout, userLogin.loadLogin);
router.post("/login", userLogin.verifyLogin);
router.get("/logout", auth.isLogin, userLogin.userLogout);
router.post("/verifyOtp", userLogin.otpsubmit);
router.get("/product", productController.userproductload);
router.get("/product-detail", productController.productDetailLoad);
//router.get('/:id',productController.productDetailLoad)
router.get("/cat", productController.womenProductLoad);
router.get("/cat", productController.menProductLoad);
router.get("/profile", auth.isLogin, profile.profileLoad);
router.get("/address", auth.isLogin, address.adressLoad);
router.get("/add-address", auth.isLogin, address.addAdressLoad);
router.post("/add-address", address.addAddress);
router.get("/edit-user", auth.isLogin, profile.editUserPage);
router.post("/edit-user", profile.editUserpost);

router.get("/edit-address", auth.isLogin, address.editAddress);
router.post("/edit-address", address.editAddresspost);
router.post("/product-detail", cart.addToCart);
router.get("/cart", auth.isLogin, cart.viewCart);
router.get("/delete", auth.isLogin, profile.deleteUser);
router.get("/forget", auth.isLogin, userLogin.forgetLoad);
router.post("/forget", userLogin.forgetPostOtp);
router.post("/forgetOtpVerify", userLogin.forgetOtpVerify);
router.post("/resetPassword", userLogin.resetPassword);
router.get("/remove", auth.isLogin, cart.removeCart);
router.get("/checkout", auth.isLogin, orderController.checkoutPage);

router.post("/order-summary", orderController.orderSummary);
router.get("/view-order", auth.isLogin, orderController.viewOrders);
router.get("/payments", auth.isLogin, orderController.paymentLoad);
router.post("/payments/create-order", orderController.payment);
router.post("/payments/verify", orderController.verifyPayment);
router.get("/order-success", auth.isLogin, orderController.orderSuccess);
router.get("/order-details", auth.isLogin, orderController.orderDetails);
router.post("/update-cart", cart.cartUpdation);
router.put("/orders/:orderId/cancel", orderController.cancellOrder);
router.put("/orders/:orderId/return", orderController.returnOrder);
router.post("/coupon-apply", orderController.couponApply);
router.get("/past-orders", auth.isLogin, orderController.pastOrder);
router.get("/invoice/:orderId", auth.isLogin, orderController.invoicedown);
router.get("/search", productController.productsearch);

module.exports = router;
