var express = require("express");
const verifyAuth = require("../middlewares/verifyAuth");
const rolesAllowed = require("../middlewares/roleBasedAuth");
const prodCollection = require("../model/prodModel");

var router = express.Router();

router.use(verifyAuth);
router.use(rolesAllowed(["customer", "admin"]));

router.get("/:page/:limit", async (req, res, next) => {
  const { page, limit } = req.params;

  const products = await prodCollection
    // .find({}, "-createdAt, -updatedAt")
    .paginate({}, { page, limit });

  if (products.docs == 0) {
    res.status(404).send({ message: "no products found" });
    return;
  }

  res.send({ products });
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prodCollection.findById(id);
    res.send({ product });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

module.exports = router;
