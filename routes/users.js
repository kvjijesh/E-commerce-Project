const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/product_controller/productController");
const orderController = require("../controllers/order_controller/orderController");
const auth = require("../middlewares/auth");
/* GET home page. */
router.get("/", userController.loadHome);
router.get("/home", auth.isLogin, userController.loadHome);
router.get("/signup", auth.isLogout, userController.loadSignup);
router.post("/signup", userController.createUser);
router.get("/login", auth.isLogout, userController.loadLogin);
router.post("/login", userController.verifyLogin);
router.get("/logout", auth.isLogin, userController.userLogout);
router.post("/verifyOtp", userController.otpsubmit);
router.get("/product", productController.userproductload);
router.get("/product-detail", productController.productDetailLoad);
//router.get('/:id',productController.productDetailLoad)
router.get("/cat", productController.womenProductLoad);
router.get("/cat", productController.menProductLoad);
router.get("/profile", auth.isLogin, userController.profileLoad);
router.get("/address", auth.isLogin, userController.adressLoad);
router.get("/add-address", auth.isLogin, userController.addAdressLoad);
router.post("/add-address", userController.addAddress);
router.get("/edit-user", auth.isLogin, userController.editUserPage);
router.post("/edit-user", userController.editUserpost);

router.get("/edit-address", auth.isLogin, userController.editAddress);
router.post("/edit-address", userController.editAddresspost);
router.post("/product-detail", userController.addToCart);
router.get("/cart", auth.isLogin, userController.viewCart);
router.get("/delete", auth.isLogin, userController.deleteUser);
router.get("/forget", auth.isLogin, userController.forgetLoad);
router.post("/forget", userController.forgetPostOtp);
router.post("/forgetOtpVerify", userController.forgetOtpVerify);
router.post("/resetPassword", userController.resetPassword);
router.get("/remove", auth.isLogin, userController.removeCart);
router.get("/checkout", auth.isLogin, orderController.checkoutPage);

router.post("/order-summary", orderController.orderSummary);
router.get("/view-order", auth.isLogin, orderController.viewOrders);
router.get("/payments", auth.isLogin, orderController.paymentLoad);
router.post("/payments/create-order", orderController.payment);
router.post("/payments/verify", orderController.verifyPayment);
router.get("/order-success", auth.isLogin, orderController.orderSuccess);
router.get("/order-details", auth.isLogin, orderController.orderDetails);
router.post("/update-cart", userController.cartUpdation);
router.put("/orders/:orderId/cancel", orderController.cancellOrder);
router.put("/orders/:orderId/return", orderController.returnOrder);
router.post("/coupon-apply", orderController.couponApply);
router.get("/past-orders", auth.isLogin, orderController.pastOrder);
router.get("/invoice/:orderId", auth.isLogin, orderController.invoicedown);
router.get("/search", productController.productsearch);

module.exports = router;
