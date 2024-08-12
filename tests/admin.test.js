const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../bin/www");

const prodCollection = require("../model/prodModel");
const userCollection = require("../model/userModel");

beforeAll(async () => {
  await userCollection.deleteMany({ role: "admin" });
  await prodCollection.deleteMany({});
});

afterAll(async () => {
  app.close();
  await mongoose.disconnect();
});

let adminToken = "";
let productTwoId = "";

describe("Testing admin routes", () => {
  test("Register an admin", async () => {
    const response = await request(app).post("/v1/auth/register").send({
      fullName: "admin joe",
      email: "adminjoe@gmail.com",
      password: "test123",
    });

    await userCollection.findOneAndUpdate(
      { email: "adminjoe@gmail.com" },
      { isEmailVerified: true, role: "admin" }
    );

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      "user created, kindly check your email to verify it"
    );
  });

  test("Login the admin", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "adminjoe@gmail.com",
      password: "test123",
    });

    adminToken = response.body.token;

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("login successful");
    expect(response.body.userDetails).toBeTruthy();
    expect(response.body.userDetails.role).toBe("admin");
    expect(response.body.token).toBeTruthy();
  });

  test("Add a product", async () => {
    const response = await request(app)
      .post("/v1/admins")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        prodName: "knife",
        prodPrice: 500,
        prodSnippet: "knife snippet",
        prodDetails: "knife details",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("product created successfully!");
    expect(response.body.product).toBeTruthy();
  });

  test("Add a second product", async () => {
    const response = await request(app)
      .post("/v1/admins")
      .set("Authorization", ` Bearer ${adminToken}`)
      .send({
        prodName: "kettle",
        prodPrice: 1000,
        prodSnippet: "kettle snippet",
        prodDetails: "kettle details",
      });

    productTwoId = response.body.product._id;

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("product created successfully!");
    expect(response.body.product).toBeTruthy();
  });

  test("Edit second product", async () => {
    const response = await request(app)
      .patch("/v1/admins/" + productTwoId)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        prodName: "kettle updated",
        prodPrice: 1000,
        prodSnippet: "kettle updated snippet",
        prodDetails: "kettle updated details",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("product updated successfully!");
    expect(response.body.updatedProduct).toBeTruthy();
  });

  test("Delete second product", async () => {
    const response = await request(app)
      .delete("/v1/admins/" + productTwoId)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("product deleted successfully!");
  });
});
