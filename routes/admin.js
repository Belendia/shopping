const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();
// this route is reached using /admin/add-products GET request
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", isAuth, adminController.postAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.post("/edit-product", isAuth, adminController.postEditProduct);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
