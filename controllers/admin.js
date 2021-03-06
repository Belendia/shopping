const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/file");

exports.postAddProduct = (req, res) => {
  // products.push({ title: req.body.title });
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  console.log(req.file);
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      errorMessage: "Attached file is not an image",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: [],
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      errorMessage: errors.array()[0].msg,
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageURL: image.path,
    userId: req.session.user,
  });
  product
    .save()
    .then((result) => {
      console.log("Created the product successfully!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    errorMessage: null,
    editing: false,
    hasError: false,
    product: {
      title: "",
      imageURL: "",
      price: "",
      description: "",
    },
    validationErrors: [],
  });
};

exports.getProducts = (req, res, next) => {
  //.populate() function is used to load a related data i.e. all users who created a product
  // .select() function is used to select specific fields. 'title price -_id' will select title and price and excludes id (- is exclude)
  Product.find({ userId: req.user._id })
    // .select("title price -_id")
    // .populate("userId", "name")
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        hasProducts: products.length > 0,
        pageTitle: "Admin products",
        path: "/admin/products",
      }); //it use shop.pug by default;
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;

  Product.findById(productId).then((product) => {
    if (!product) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      errorMessage: null,
      editing: editMode,
      hasError: false,
      product: product,
      validationErrors: [],
    });
  });
};

exports.postEditProduct = (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      errorMessage: errors.array()[0].msg,
      editing: true,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        _id: id,
      },
      validationErrors: errors.array(),
    });
  }

  Product.findById(id)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        // Delete the image associated with the product.
        fileHelper.deleteFile(product.imageURL);
        product.imageURL = image.path;
      }

      return product.save().then((result) => {
        console.log("Updated Products");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.id;

  Product.findById(id)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found"));
      }

      // Delete the image associated with the product
      fileHelper.deleteFile(product.imageURL);
      // Then delete the product itself from the database.
      return Product.deleteOne({ _id: id, userId: req.user._id });
    })
    .then((result) => {
      console.log("Destroyed the product!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
