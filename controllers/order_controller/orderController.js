const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Address = require("../../models/addressModel");
const Order = require("../../models/orderModel");
const { use } = require("../../routes/users");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Coupon = require("../../models/couponModel");
const pdfkit = require("pdfkit");
const fs = require("fs");
const moment = require("moment");
const easyinvoice=require('easyinvoice')

const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

function generateOrderId() {
  const timestamp = Date.now().toString();
  return timestamp;
}

const hbs = require("hbs");
const { findById } = require("../../models/userModel");

hbs.registerHelper("eq", function (a, b) {
  return a === b;
});
hbs.registerHelper("noteq", function (a, b) {
  return a !== b;
});
hbs.registerHelper("formatDate", function (date, format) {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    // timeZone: 'UTC'
  };
  const formattedDate = new Date(date).toLocaleString("en-US", options);
  return formattedDate;
});
hbs.registerHelper("for", function (from, to, incr, block) {
  let accum = "";
  for (let i = from; i <= to; i += incr) {
    accum += block.fn(i);
  }
  return accum;
});

const checkoutPage = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findOne({ _id: userId }).populate("cart.product");
    const cart = user.cart;
    if (cart.length < 1) {
      res.redirect("/product");
    }
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
    res.status(500).send({message:`${error}`})

  }
};

const orderSummary = async (req, res) => {
  try {
    const { address, cartTotal, paymentMode, discount } = req.body;
    console.log(req.body)
    const orderDate = new Date();
    const formattedDate = moment(orderDate).format("DD-MM-YYYY");
    const userData = req.session.user;
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("cart.product");
    const cartItems = user.cart.map((item) => {
      return {
        product: item.product._id,
        quantity: item.quantity,
      };
    });
    if(req.body&&address&&cartTotal&&paymentMode){


    if (paymentMode == "cashondelivery") {
      const orderId = generateOrderId();

      if (user.cart.length > 0) {
        const order = new Order({
          owner: userData._id,
          address: address,
          items: cartItems,
          paymentMode: paymentMode,
          orderBill: cartTotal,
          discount: discount,
          orderDate: formattedDate,
          orderId: orderId,
        });
        await order.save();
        for (const item of cartItems) {
          const productId = item.product._id;
          const quantity = item.quantity;
          const product = await Product.findById(productId);
          product.stock -= quantity;
          await product.save();
        }

        user.cart = [];
        const newuserData = await user.save();
        req.session.user = newuserData;
        res.json(order);
      } else {
        res.redirect("/product");
      }
    } else {
      const orderId = generateOrderId();
      if (user.cart.length > 0) {
        const order = new Order({
          owner: userData._id,
          address: address,
          items: cartItems,
          paymentMode: req.body.paymentMethod,
          orderBill: req.body.cartTotal,
          discount: discount,
          orderDate: formattedDate,
          orderId: orderId,
        });
        await order.save();
        for (const item of cartItems) {
          const productId = item.product._id;
          const quantity = item.quantity;
          const product = await Product.findById(productId);
          product.stock -= quantity;
          await product.save();
        }

        user.cart = [];
        const newuserData = await user.save();
        req.session.user = newuserData;

        //res.redirect('/payments')
        res.json(order);
      } else {
        res.redirect("/product");
      }
    }
  }
  else{
        res.send({message:"something went wrong"})
  }
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const viewOrders = async (req, res) => {
  try {
    const pageNum = req.query.page;
    const Perpage = 3;
    const userData = req.session.user;
    const orderData = await Order.find({
      owner: userData._id,
      status: { $nin: ["returned"] },
    })
      .populate("items.product")
      .populate("address")
      .skip((pageNum - 1) * Perpage)
      .limit(Perpage)
      .sort({ orderDate: -1 });
    const orderCount = await Order.find({
      owner: userData._id,
      status: { $nin: ["returned"] },
    }).count();


    res.render("userViews/viewOrders", {
      orderData: orderData,
      userData: userData,
      orderCount: orderCount,
      currentPage: pageNum,
      pages: Math.ceil(orderCount / Perpage),
    });
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const paymentLoad = async (req, res) => {
  try {
    const userData = req.session.user;
    // const orderData= await Order.findOne({owner:userData._id}).populate("items.product").populate("address")
    const userId = req.session.user._id;
    const user = await User.findOne({ _id: userId }).populate("cart.product");
    const order = await Order.findOne({ owner: userId }).sort({
      createdAt: -1,
    });

    res.render("userViews/paymentPage", { userData: userData, order });
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const payment = async (req, res) => {

  const { amount, currency } = req.body;

  var options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: currency,
    receipt: "order_rcptid_1",
  };
  instance.orders.create(options, function (err, order) {

    res.send({ orderId: order.id });
  });
};

const verifyPayment = async (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;


  var expectedSignature = crypto
    .createHmac("sha256", "KkAXvkunE3WzLphvq5OJ6cHE")
    .update(body.toString())
    .digest("hex");

  var response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
};

const orderSuccess = async (req, res) => {
  const userData = req.session.user;
  res.render("userViews/orderSummary", { userData });
};
const orderDetails = async (req, res) => {
  try {
  const userData = req.session.user;
  const orderId = req.query.id;

  const orderData = await Order.findById(orderId)
    .populate("items.product")
    .populate("address");


  res.render("userViews/orderDetails", { userData, orderData });
} catch (error) {
  res.status(500).send({message:`${error}`})
}
};

const cancellOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: "cancelled" },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {

    res.status(500).json({ error: "Something went wrong" });
  }
};

const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: "returned" },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {

    res.status(500).json({ error: "Something went wrong" });
  }
};

const couponApply = async (req, res) => {
  try {
    const userData = req.session.user;
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code });
    if (!coupon) {
      return res.status(400).json({ error: "Invalid coupon code" });
    }
    const couponDiscount = coupon.value;
    if (coupon.usedby.includes(userData._id)) {
      return res
        .status(400)
        .json({ error: "Coupon has already been used by the same user" });
    }

    if (cartTotal > coupon.minBill) {
      const discount = cartTotal * (couponDiscount / 100);
      const data = Math.floor(cartTotal - discount);
      coupon.usedby.push(userData._id);
      await coupon.save();

      res.json({ cartTotal: data, discount: discount });
    } else {
      res.status(400).json({ error: "Cart total must be greater than 499" });
    }
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};
const pastOrder = async (req, res) => {
  try {
    const pageNum = req.query.page;
    const Perpage = 3;
    const userData = req.session.user;
    const pastOrder = await Order.find({
      owner: userData._id,
      status: { $in: ["returned"] },
    })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * Perpage)
      .limit(Perpage);

    const orderCount = await Order.find({
      owner: userData._id,
      status: { $in: ["returned"] },
    }).count();
    res.render("userViews/pastOrders", {
      pastOrder,
      userData,
      orderCount: orderCount,
      currentPage: pageNum,
      pages: Math.ceil(orderCount / Perpage),
    });
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const invoicedown = async (req, res) => {

  try {
    const orderid = req.params.orderId
    const userdata = req.session.user
    const userid = userdata._id
    const userdatas = await User.findById(userid).populate('cart.product')
    const orderdata = await Order.findById(orderid).populate('items.product').populate('address')


    const productdata = orderdata.items

    const invoiceItems = []

    productdata.map((item) => {
      const product = item.product
      const quantity = item.quantity
      const total = product.price * quantity
      const pro = {
        'name': `${product.name}`,
        "quantity": `${quantity}`,
        'description': `${product.description}`,
        'total': `${total}`,
        'price': `${product.price}`
      };

      invoiceItems.push(pro);
    })

    var currentDate = new Date()

    var data = {

      "customize": {

      },

      // Your own data
      "sender": {
        "company": "STYLE MAVEN",
        "address": "HSR Layout 4th phase",
        "zip": "670895 ",
        "city": "Bengaluru",
        "country": "India"

      },
      // Your recipient
      "client": {
        "company": `${orderdata.address.name}`,
        "address1": `${orderdata.address.address1}`,
        "address2": `${orderdata.address.address2}`,
        "city": `${orderdata.address.city}`,
        "zip": `${orderdata.address.zip}`,
        "country": "India"

      },
      "information": {
        // Invoice number
        "number": `${orderdata.orderId}`,
        // Invoice data
        "date": `${orderdata.orderDate}`

      },

      "products": invoiceItems,


      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Thank You for the Purchase !.",
      // Settings to customize your invoice
      "settings": {
        "currency": "INR",
        "locale": "nl-NL",
        "margin-top": 25,
        "margin-right": 25,
        "margin-left": 25,
        "margin-bottom": 25,
        "format": "A4",
        "height": "1000px",
        "width": "500px",
        "orientation": "landscape",
      },

    };

    //Create your invoice! Easy!
    await easyinvoice.createInvoice(data, function (result) {
      //The response will contain a base64 encoded PDF file

      easyinvoice.createInvoice(data, function (result) {
        //The response will contain a base64 encoded PDF file
        const fileName = 'invoice.pdf';
        const pdfBuffer = Buffer.from(result.pdf, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
        res.send(pdfBuffer);
      })
      console.log('PDF base64 string: ');
    });

  } catch (error) {
    res.status(500).send({error:`${error}`})
  }

}




//exprts
module.exports = {
  checkoutPage,
  orderSummary,
  viewOrders,
  payment,
  verifyPayment,
  paymentLoad,
  orderSuccess,
  orderDetails,
  cancellOrder,
  returnOrder,
  couponApply,
  pastOrder,
  invoicedown,
};
