const Banner = require("../../models/bannerModel");

const bannerLoad = async (req, res) => {
  try {
    const banner = await Banner.find();
    res.render("adminViews/banner", { banner });
  } catch (error) {
    res.render("error");
  }
};

const createBannerLoad = async (req, res) => {
  try {
    res.render("adminViews/createBanner");
  } catch (error) {
    res.render("error");
  }
};

const createBanner = async (req, res) => {
  const { file } = req;
  const fileName = file.filename;
  try {
    const banner = await Banner.create({
      title: req.body.title,
      description: req.body.description,
      image: fileName,
      linkUrl: req.body.linkUrl,
      status: req.body.status,
    });
    res.redirect("/admin/banner");
  } catch (error) {
    res.render("error");
  }
};

const editBannerLoad = async (req, res) => {
  try {
    const banner = await Banner.findById(req.query.id);
    res.render("adminViews/editBanner", { banner });
  } catch (error) {
    console.log(error.message);
    res.render("error");
  }
};

const editBanner = async (req, res) => {
  try {
    const bannerId  = req.query.id;
    const bannerImg = await Banner.findById(bannerId);
    const exstImg = bannerImg.image;

    let upImage;

    const file = req.file;

    if (file) {
      const newImage = file.filename;
      upImage = newImage;
      bannerImg.image = upImage;
    } else {
      upImage = exstImg;
    }

    await Banner.findByIdAndUpdate(
      bannerId,
      {
        title: req.body.title,
        description: req.body.description,
        image: upImage,
        linkUrl: req.body.linkUrl,
        status: req.body.status,
      },
      { new: true }
    );

    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error);
  }
};

const deleteBanner = async (req, res) => {
  const id  = req.query.id;
  try {
    await Banner.findByIdAndDelete(id);
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error);
    res.render("error");
  }
};

module.exports = {
  bannerLoad,
  createBannerLoad,
  createBanner,
  editBannerLoad,
  editBanner,
  deleteBanner,
};
