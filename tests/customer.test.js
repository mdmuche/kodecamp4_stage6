const app = require("../bin/www");
const mongoose = require("mongoose");

const request = require("supertest");
const orderCollection = require("../model/orderModel");
const userCollection = require("../model/userModel");

beforeAll(async () => {
  await userCollection.deleteMany({ role: "customer" });
  await orderCollection.deleteMany({});
});

afterAll(async () => {
  app.close();
  await mongoose.disconnect();
});

let userToken = "";
let productOneId = "";

describe("Testing customer routes", () => {
  test("Register a customer", async () => {
    const response = await request(app).post("/v1/auth/register").send({
      fullName: "john doe",
      email: "johndoe@gmail.com",
      password: "test123",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("user created");
  });

  test("Login the customer", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "johndoe@gmail.com",
      password: "test123",
    });

    userToken = response.body.token;

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("login successful");
    expect(response.body.userDetails).toBeTruthy();
    expect(response.body.userDetails.role).toBe("customer");
  });

  test("View products", async () => {
    const response = await request(app)
      .get("/v1/product/1/10")
      .set("Authorization", `Bearer ${userToken}`);

    productOneId = response.body.products.docs[0]._id;

    expect(response.status).toBe(200);
    expect(typeof response.body.products).toBe("object");
  });

  test("View a single product", async () => {
    const response = await request(app)
      .get("/v1/product/" + productOneId)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.product.prodName).toBe("knife");
  });

  test("Creating an order", async () => {
    const response = await request(app)
      .post("/v1/customers/order")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        products: [
          {
            productId: productOneId,
            quantity: 5,
            totalCost: 2500,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("order created");
  });

  test("Checkout with order(s)", async () => {
    const response = await request(app)
      .get("/v1/customers/orders")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(typeof response.body.orders).toBe("object");
  });
});
