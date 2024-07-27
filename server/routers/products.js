const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const isAdmin = require("../helpers/isAdmin");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isValid = FILE_TYPE_MAP[file.mimetype];
  if (!isValid) {
    return cb(new Error("Invalid Image Type"), false);
  }
  cb(null, true);
};

const uploadOptions = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Get all products - User & Admin Dashboard
router.get(`/`, async (req, res) => {
  //products?categories=2342342,234234
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");
  //.select("name image -_id") // to select only name and image

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// Get product details - User & Admin Dashboard
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

// Create product - Admin Dashboard
router.post(`/`, isAdmin, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = file.originalname.split(" ").join("-").split(".")[0];
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  const webpFileName = `${fileName}-${Date.now()}.webp`;
  const filePath = `public/uploads/${webpFileName}`;

  await sharp(file.buffer)
    .resize(800) // İsteğe bağlı olarak boyutlandırma
    .webp({ lossless: true }) // Kayıpsız sıkıştırma
    .toFile(filePath);

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${webpFileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("the product cannot be created!");

  res.send(product);
});

// Update product - Admin Dashboard
router.put("/:id", isAdmin, uploadOptions.single("image"), async (req, res) => {
  // Check if the product id is valid
  const productExist = await Product.findById(req.params.id);
  if (!productExist) return res.status(400).send("Invalid Product Id");
  // Check if the category id is valid
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  let imagePath = req.body.image;
  const file = req.file;

  if (file) {
    const fileName = file.originalname.split(" ").join("-").split(".")[0];
    const webpFileName = `${fileName}-${Date.now()}.webp`;
    const filePath = `public/uploads/${webpFileName}`;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    // Delete old image
    const product = await Product.findById(req.params.id);
    if (product && product.image) {
      const oldImagePath = product.image.replace(basePath, "");
      fs.unlink(`public/uploads/${oldImagePath}`, (err) => {
        if (err) {
          console.error(`Failed to delete image: ${imagePath}`, err);
        }
      });
    }
    // Save new image
    await sharp(file.buffer)
      .resize(800)
      .webp({ lossless: true })
      .toFile(filePath);

    imagePath = `${basePath}${webpFileName}`;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!updatedProduct)
    return res.status(500).send("the product cannot be updated!");

  res.send(updatedProduct);
});

// Delete product - Admin Dashboard
router.delete("/:id", isAdmin, (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

// Get product count - User & Admin Dashboard
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments({});

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

// Get featured products - User & Admin Dashboard
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

// Upload gallery images - Admin Dashboard
router.put(
  "/gallery-images/:id",
  isAdmin,
  uploadOptions.array("images", 5),
  async (req, res) => {
    // Check if the product id is valid
    const productExist = await Product.findById(req.params.id);
    if (!productExist) return res.status(400).send("Invalid Product Id");

    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      // Delete old images
      const product = await Product.findById(req.params.id);
      if (product && product.images.length > 0) {
        product.images.forEach((image) => {
          const imagePath = image.replace(basePath, "");
          fs.unlink(`public/uploads/${imagePath}`, (err) => {
            if (err) {
              console.error(`Failed to delete image: ${imagePath}`, err);
            }
          });
        });
      }
      // Save new images
      for (const file of files) {
        const fileName = file.originalname.split(" ").join("-").split(".")[0];
        const webpFileName = `${fileName}-${Date.now()}.webp`;
        const filePath = `public/uploads/${webpFileName}`;

        await sharp(file.buffer)
          .resize(800) // İsteğe bağlı olarak boyutlandırma
          .webp({ lossless: true }) // Kayıpsız sıkıştırma
          .toFile(filePath);

        imagesPaths.push(`${basePath}${webpFileName}`);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!updatedProduct)
      return res.status(500).send("the product cannot be updated!");

    res.send(updatedProduct);
  }
);

module.exports = router;
