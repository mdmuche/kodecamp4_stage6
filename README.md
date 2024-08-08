# ECOMMERCE API

This is a project to authenticate two kinds of users **admin** and **customer** assigning them to their specific roles

## Features

- Both kinds of users can register and login
- Admin can add, edit and delete a product
- customer can view all products, view single products, add an order and checkout with products
- testing using jest and supertest

## Installation

- Clone repository
  `git clone https://github.com/mdmuche/kodecamp4_stage6.git`

- Change directory
  `cd kodecamp4_stage6`

- Install dependency
  `npm install`

- Install dev-dependency
  `npm install --save-dev nodemon`

- Setup .env config files

  ```
   PORT=3000

   URL=url_mongodb_url_here

   SECRET=your_secret_key
  ```

- Start your application
  `npm start`

## Register and Login Routes

POST /v1/auth/register
Creates a user for both admin and customers with paths: fullName, email and password

Request body

```
Content-Type: application/json

{
    "fullName": "john doe",
    "email": "johndoe@gmail.com",
    "password": "your_password"
}

POST /v1/auth/login
Login a user for both admin and customers with paths: email and password

Request body
```

Content-Type: application/json

{
"email": "johndoe@gmail.com",
"password": "your_password"
}

## Admin Routes

POST /v1/admins
Create product with paths: prodName, prodPrice, prodSnippet, prodDetails

Request body with header

```
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
    "prodName": "prodName_here",
      "prodPrice": Number(prodPrice),
      "prodSnippet": "prodSnippet_here",
      "prodDetails": "prodDetails_here"
}
```

PATCH /v1/admins/${id}
Edit product with paths: prodName, prodPrice, prodSnippet, prodDetails where id is your ObjectId(\_id)

Request body and header

```
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
"prodName": "prodName_updated_here",
"prodPrice": Number(prodPrice),
"prodSnippet": "prod_snippet_updated_here",
"prodDetails": "prod_details_updated_here"
}
```

DELETE /v1/admins/${id}
Create product with paths: prodName, prodPrice, prodSnippet, prodDetails

Request header

```
Authorization: Bearer your_jwt_token
```

## Customer Routes

GET /v1/product/${page}/${limit}
View products with pagination where ${page} && ${limit} must be a Number

Request header

```
Authorization: Bearer your_jwt_token
```

GET /v1/product/${id}
view a single product with an ObjectId(\_id)

Request header

```
Authorization: Bearer your_jwt_here
```

POST /v1/customers/order
Create an order order items(products) containing paths: productId, quantity, and totalCost

Request body and header

```
Content-Type: application/json
Authorization: Bearer your_jwt_here

{
    "products": [
        {
        "productId": productOrderedOneId,
        "quantity": 5,
        "totalCost": 2500
        },
        {
        "productId": productOrderedTwoId,
        "quantity": 2,
        "totalCost": 2000
        }
    ]
}
```

GET /v1/customers/orders
Get all your orders

Request header

```
Authorization: Bearer your_jwt_token
```
