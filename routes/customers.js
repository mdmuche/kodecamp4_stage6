var express = require("express");
const orderCollection = require("../model/orderModel");
const verifyAuth = require("../middlewares/verifyAuth");
const rolesAllowed = require("../middlewares/roleBasedAuth");
var router = express.Router();

router.use(verifyAuth);
router.use(rolesAllowed(["customer"]));

router.post("/order", async (req, res, next) => {
  try {
    const { products } = req.body;

    const user = await orderCollection.find({
      customer: req.userDetails.userId,
    });

    if (!user) {
      res.status(403).send({ message: "not a valid user" });
      return;
    }

    await orderCollection.create({
      customer: req.userDetails.userId,
      products,
    });

    res.status(201).send({ message: "order created" });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const orders = await orderCollection
      .find(
        { customer: req.userDetails.userId },
        "products.productId products.quantity products.totalCost"
      )
      .populate(
        "products.productId",
        "prodName prodPrice prodSnippet prodDetails"
      );

    if (orders.length == 0) {
      res.status(404).send({ message: "no orders found" });
      return;
    }

    res.send({ orders });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

module.exports = router;
