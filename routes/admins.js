var express = require("express");
const verifyAuth = require("../middlewares/verifyAuth");
const rolesAllowed = require("../middlewares/roleBasedAuth");
const prodCollection = require("../model/prodModel");

var router = express.Router();

router.use(verifyAuth);
router.use(rolesAllowed(["admin"]));

router.post("/", async (req, res, next) => {
  try {
    const { prodName, prodPrice, prodSnippet, prodDetails } = req.body;

    if (!prodName || !prodPrice || !prodSnippet || !prodDetails) {
      res.status(400).send({ message: "input field required" });
      return;
    }

    await prodCollection.create({
      prodName,
      prodPrice,
      prodSnippet,
      prodDetails,
    });

    res.status(201).send({ message: "product created successfully!" });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { prodName, prodPrice, prodSnippet, prodDetails } = req.body;

    if (!prodName || !prodPrice || !prodSnippet || !prodDetails) {
      res.status(400).send({ message: "input field required" });
      return;
    }

    const updatedProduct = await prodCollection.findByIdAndUpdate(
      id,
      {
        prodName,
        prodPrice,
        prodSnippet,
        prodDetails,
      },
      { new: true }
    );

    res.status(200).send({
      message: "product updated successfully!",
      updatedProduct,
    });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;

  const product = await prodCollection.findById(id);

  if (!product) {
    res.status(404).send({ message: "product not found" });
    return;
  }

  await prodCollection.findByIdAndDelete(id);

  res.send({ message: "product deleted successfully!" });
});

module.exports = router;
