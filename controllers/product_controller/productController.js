const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");
const hbs = require("hbs");

hbs.registerHelper("not", function (value) {
  return !value;
});

hbs.registerHelper("or", function (a, b) {
  return a || b;
});

const addProduct = async (req, res) => {
  try {
    const userGivenCat = req.body.category;

    const category = await Category.find({ name: userGivenCat });

    const categoryId = category._id;
    //
    //
    // if(!category){

    //     res.render('adminViews/addproduct',{message:"Category does not exist "})
    // }
    const file = req.files;

    const images = [];
    file.forEach((file) => {
      const image = file.filename;
      images.push(image);
    });

    const basePath = "/images/";

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: images,
      category: userGivenCat,
      stock: req.body.stock,
      is_blocked: false,
    });
    await product.save();
    if (!product) {
      return res.status(404).json({
        message: "product not found",
      });
    }
    // res.status(201).json(product)
    res.redirect("/admin/product");
  } catch (error) {

    res.status(500).json({
        message:error.message
    })
  }
};

const getAllProducts = async (req, res) => {
  try {
    const productData = await Product.find().populate("category");
    if (!productData) {
      // return res.status(404).json({
      //     message:'product not found'
      // })
      res.render("adminViews/product");
    }
    // res.status(200).json(products)
    res.render("adminViews/product", { products: productData });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({
        message: "product not found",
      });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const editProductLoad = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.find();
    const prodData = await Product.findById({ _id: id }).populate("category");
    if (prodData) {
      res.render("adminViews/edit", { products: prodData, category });
    } else {
      res.redirect("/admin/home");
    }
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const updateProduct = async (req, res) => {
  try {
    const proId = req.params.id;
    if (!mongoose.isValidObjectId(proId)) {
      return res.status(400).json({
        message: "invalid id",
      });
    }

    const category = await Category.findById(req.body.category);

    if (!category) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    const product = await Product.findById(proId);
    const exImage = product.imageUrl;
    const files = req.files;
    let updImages = [];

    if (files && files.length > 0) {
      const newImages = req.files.map((file) => file.filename);
      updImages = newImages;
      product.imageUrl = updImages;
    } else {
      updImages = exImage;
    }

    await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: updImages,
        category: req.body.category,
        stock: req.body.stock,
        is_blocked: req.body.is_blocked,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "product canot be upated",
      });
    } else {
      res.redirect("/admin/product");
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const addProductLoad = async (req, res) => {
  const category = await Category.find();

  try {
    res.render("adminViews/addproduct", { category: category });
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const userproductload = async (req, res) => {
  try {
    const categories = await Category.find();
    const { category, sort } = req.query;


    const filter = { is_blocked: false };
    if (category) {
      filter.category = category;
    }

    let sortOption = {};
    if (sort) {
      if (sort === "name") {
        sortOption = { name: 1 };
      } else if (sort === "price") {
        sortOption = { price: 1 };
      } else if (sort === "popularity") {
        sortOption = { popularity: -1 };
      }
    }

    const productData = await Product.find(filter)
      .sort(sortOption)
      .populate("category");

    if (req.session.userData) {
      const userData = req.session.user;
      res.render("userViews/producthome", {
        products: productData,
        userData,
        categories,
      });
    } else {
      res.render("userViews/producthome", {
        products: productData,
        categories,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const productDetailLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = req.session.user;
    const prodData = await Product.findById({ _id: id });


    if (req.session.user) {
      const isCart = await User.findOne({
        _id: userData._id,
        "cart.product": id,
      });
      if (prodData) {
        res.render("userViews/productDetail", {
          products: prodData,
          userData,
          isCart,
        });
      } else {
        res.redirect("/product");
      }
    } else {
      res.render("userViews/productDetail", { products: prodData });
    }
  } catch (error) {
    res.render("error", { error: error });
  }
};

const womenProductLoad = async (req, res) => {

  try {


  const categoryId = req.query.id;
  const userData = req.session.user;

  const productWomen = await Product.find({
    category: categoryId,
    is_blocked: false,
  });

  if (userData) {

    res.render("userViews/womenpage", { women: productWomen, userData });
  } else {
    res.render("userViews/womenpage", { women: productWomen });
  }
} catch (error) {
  res.status(500).send({message:`${error}`})
}
};
const menProductLoad = async (req, res) => {
  try {

  const categoryId = req.query.id;
  const productmen = await Product.find({
    category: categoryId,
    is_blocked: false,
  });

  res.render("userViews/menspage", { men: productmen });

} catch (error) {
  res.status(500).send({message:`${error}`})
}
};

const blockProduct = async (req, res) => {
  const data = await Product.findById(req.params.id);
  const blockstatus = data.is_blocked;
  try {
      await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          is_blocked: !blockstatus,
        },
      },
      { new: true }
    );
    res.redirect("/admin/product");
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};
const productsearch = async (req, res) => {
  try {
    const query = req.query.q;


    const results = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    
    res.json(results);
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

//export
module.exports = {
  addProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  editProductLoad,
  addProductLoad,
  userproductload,
  productDetailLoad,
  womenProductLoad,
  menProductLoad,
  blockProduct,
  productsearch,
};
