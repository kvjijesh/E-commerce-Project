const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address=require('../models/addressModel')
const Order=require('../models/orderModel');
const { use } = require("../routes/users");
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Coupon=require('../models/couponModel')



const instance = new Razorpay({
  key_id: 'rzp_test_Crtfv9xGM7cd2j',
  key_secret: 'KkAXvkunE3WzLphvq5OJ6cHE',
});

function generateOrderId() {
  const timestamp = Date.now().toString();
  return timestamp ;
}

const hbs = require('hbs');

hbs.registerHelper('eq', function(a, b) {
  return a === b;
});
hbs.registerHelper('formatDate', function(date, format) {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    // timeZone: 'UTC'
  };
  const formattedDate = new Date(date).toLocaleString('en-US', options);
  return formattedDate;
});



const checkoutPage = async (req, res) => {
  try {

    const userId = req.session.user._id;

    const user = await User.findOne({ _id: userId }).populate("cart.product");

    const cart = user.cart;

    const address = await Address.find({ owner: userId });

let cartTotal = 0;
cart.forEach((item) => {
  const product = item.product;
  const quantity = item.quantity;
  const total = product.price * quantity;
  item.total = total;
  cartTotal += total;
});



    res.render("userViews/checkoutPage", {
      userData: req.session.user,
      address,
      cartItems: cart,
      cartTotal,
    });
  } catch (error) {
    console.log(error.message);
    res.render("error");
  }
};

const orderSummary = async (req, res) => {
    try {

    const orderData = req.body;
    const address=req.body.address
    console.log(orderData);
    const cartTotal=req.body.cartTotal
    const paymentMode=req.body.paymentMethod
    const userData=req.session.user
    const userId=req.session.user._id
    const user = await User.findById(userId).populate('cart.product');
    console.log(user);

    const cartItems = user.cart.map(item => {
      return {
        product: item.product._id,
        quantity: item.quantity
      };
    });
    if(paymentMode=='cashondelivery'){

      const orderId=generateOrderId()

      if((user.cart.length)>0){
      const order=new Order({
        owner:userData._id,
        address:address,
        items: cartItems,
        paymentMode:req.body.paymentMethod,
        orderBill:cartTotal,
        orderId:orderId


    })
    await order.save()
     user.cart = [];
     const newuserData= await user.save();
     req.session.user=newuserData
    // console.log(user);



    // res.render("userViews/orderSummary",{userData:req.session.user});
    res.json(order)

    }else{
      res.redirect('/product')
    }
  }
    else{
      const orderId=generateOrderId()
      if((user.cart.length)>0){
        const order=new Order({
          owner:userData._id,
          address:address,
          items: cartItems,
          paymentMode:req.body.paymentMethod,
          orderBill:req.body.cartTotal,
          orderId:orderId

      })
      await order.save()
      // user.cart = [];
      // const newuserData= await user.save();
      // req.session.user=newuserData

      //res.redirect('/payments')
      res.json(order)

        // res.render('userViews/paymentPage',{userData:req.session.user,cartTotal:cartTotal})

    }else{
      res.redirect('/product')

  }}
} catch (error) {
    console.log(error.message);

}
}

const viewOrders=async(req,res)=>{
  try {
    const userData=req.session.user
    const orderData= await Order.find({owner:userData._id}).populate("items.product").populate("address").sort({ createdAt: -1 });



    console.log(orderData);

    res.render('userViews/viewOrders',{orderData:orderData,userData:userData})

  } catch (error) {
console.log(error.message);
  }
}

const paymentLoad=async(req,res)=>{
  const userData=req.session.user
  // const orderData= await Order.findOne({owner:userData._id}).populate("items.product").populate("address")

  const userId = req.session.user._id;
  const user = await User.findOne({ _id: userId }).populate("cart.product");
  const cart = user.cart;
let cartTotal = 0;
cart.forEach((item) => {
const product = item.product;
const quantity = item.quantity;
const total = product.price * quantity;
item.total = total;
cartTotal += total;
});



  res.render('userViews/paymentPage',{cartTotal,userData:userData})

}



const payment=async(req,res)=>{
console.log(req.body);
const {amount,currency}=req.body;
  var options = {
    amount: amount*100,  // amount in the smallest currency unit
    currency: currency,
    receipt: "order_rcptid_1"
  };
  instance.orders.create(options, function(err, order) {
    console.log(order);
    res.send({orderId: order.id})
  });
};

const verifyPayment=async(req,res)=>{
  let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
  console.log(body);


  var expectedSignature = crypto.createHmac('sha256', 'KkAXvkunE3WzLphvq5OJ6cHE')
                                  .update(body.toString())
                                  .digest('hex');
                                  console.log("sig received " ,req.body.response.razorpay_signature);
                                  console.log("sig generated " ,expectedSignature);
  var response = {"signatureIsValid":"false"}
  if(expectedSignature === req.body.response.razorpay_signature)
   response={"signatureIsValid":"true"}
      res.send(response);
}

const orderSuccess= async(req,res)=>{

  res.render('userViews/orderSummary')
}
const orderDetails=async(req,res)=>{
  const userData=req.session.user

  const orderId=req.query.id
  console.log(orderId);
  const orderData= await Order.findById(orderId).populate("items.product").populate("address")
  console.log(orderData);

  res.render('userViews/orderDetails',{userData,orderData})


}

const cancellOrder=async(req,res)=>{
try {
  const orderId = req.params.orderId;
  console.log(orderId,"hiiiii")

  const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'cancelled' }, { new: true });
  console.log(updatedOrder);
  res.json(updatedOrder);


} catch (error) {

  console.error(error);
  res.status(500).json({ error: 'Something went wrong' });

}

}

const returnOrder=async(req,res)=>{
  try {
    const orderId = req.params.orderId;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'returned' }, { new: true });
    console.log(updatedOrder);
    res.json(updatedOrder);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });

  }
}

const couponApply = async (req, res) => {
  try {
    const userData=req.session.user
    const { code, cartTotal } = req.body;
    console.log(code, cartTotal);

    const coupon = await Coupon.findOne({ code: code });
    if (!coupon) {
      return res.status(400).json({ error: "Invalid coupon code" });
    }

    const couponDiscount = coupon.value;
    if (coupon.usedby.includes(userData._id)) {
      return res.status(400).json({ error: "Coupon has already been used by the same user" });
    }


    if (cartTotal > 499) {
      const discount = cartTotal * (couponDiscount / 100);
      const data = cartTotal - discount;
      console.log(data);

      coupon.usedby.push(userData._id);
      await coupon.save();


      res.json({ cartTotal: data });
    } else {
      res.status(400).json({ error: "Cart total must be greater than 499" });
    }

  } catch (error) {
    console.log(error);
  }
};





//exprts
module.exports={checkoutPage,
orderSummary,viewOrders,payment,
verifyPayment,paymentLoad,orderSuccess,orderDetails,cancellOrder,returnOrder,couponApply
}
