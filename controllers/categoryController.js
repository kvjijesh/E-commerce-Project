const Category = require("../models/categoryModel");

const createCategory = async (req, res) => {
  try {
    const str = req.body.name;

    function capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    const name = capitalizeFirstLetter(str);

    console.log(req.body);
    const file = req.file;
    const fileName = file.filename;
    const basePath = "/images/";
    const categoryData = await Category.findOne({ name: name });
    console.log(categoryData);
    if (categoryData == null) {
      const category = new Category({
        name: name,
        image: `${basePath}${fileName}`,
      });
      await category.save();
      res.redirect("/admin/category");
    } else {
      res.render("adminViews/addCategory", {
        message: "category already exist",
      });
    }
  } catch (error) {
    console.log("hi");
    console.log(error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    let id = req.params.id;

    await Category.findByIdAndDelete(id);
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "server error" });
  }
};
const getCategoryList = async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(400).json({ message: "category not found" });
  } else {
    // res.status(200).json(categoryList)
    res.render("adminViews/categorylist", { categories: categoryList });
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(400).json({ message: "category not found" });
    } else {
      res.status(200).json(category);
    }
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const file = req.file;
    const fileName = file.filename;
    const basePath = "/images/";
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: `${basePath}${fileName}`,
      },
      { new: true }
    );
    res.redirect("/admin/category");
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};
const addCategoryLoad = async (req, res) => {
  res.render("adminViews/addcategory");
};
const editCategoryLoad = async (req, res) => {
  try {
    const id = req.params.id;
    const catData = await Category.findById({ _id: id });
    if (catData) {
      res.render("adminViews/editCategory", { category: catData });
    } else {
      res.redirect("/admin/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//export

module.exports = {
  createCategory,
  deleteCategory,
  getCategoryList,
  getCategory,
  updateCategory,
  addCategoryLoad,
  editCategoryLoad,
};
