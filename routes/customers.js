var express = require("express");
const orderCollection = require("../model/orderModel");
const prodCollection = require("../model/prodModel");
const verifyAuth = require("../middlewares/verifyAuth");
const rolesAllowed = require("../middlewares/roleBasedAuth");
var router = express.Router();

router.use(verifyAuth);
router.use(rolesAllowed(["customer"]));

router.post("/order", async (req, res, next) => {
  try {
    // const { items } = req.body;

    // // console.log(items);

    // const orderItems = items.map((item) => ({
    //   product: item.productId,
    //   quantity: item.quantity,
    //   totalCost: item.totalCost,
    // }));

    // // console.log(orderItems);

    // // let price = await prodCollection.findOne({ prodPrice });
    // // totalCost = price * quantity;

    // // const { productId, quantity, totalCost } = req.body;

    // // if (!productId | quantity || totalCost) {
    // //   res.status(404).send({ message: "input field required" });
    // //   return;
    // // }

    // await orderCollection.create({
    //   orderItems,
    // });

    const { items } = req.body;

    await orderCollection.create(items);

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
      .find({}, "productId quantity totalCost")
      .populate("productId", "prodName prodPrice prodSnippet prodDetails");

    console.log(orders);

    if (orders.items == 0) {
      res.status(404).send({ message: "no order found" });
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

router.post("/checkout", async (req, res, next) => {
  try {
    const { items } = req.body;

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await prodCollection.findById(item.productId);

        if (!product) {
          res.status(404).send({ message: "product not found" });
          return;
        }

        let price = await prodCollection.findOne({ prodPrice });
        const totalCost = price * item.quantity;

        return {
          product: product._id,
          quantity: item.quantity,
          totalCost,
        };
      })
    );

    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.totalCost,
      0
    );

    const order = await orderCollection.create({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
    });

    res.status(201).send({
      message: "order created",
      order,
    });
  } catch (err) {
    console.error("server error", err.message);
    return res
      .status(500)
      .send({ message: "internal server error", error: err.message });
  }
});

module.exports = router;
