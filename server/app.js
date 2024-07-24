const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

app.use(cors());
app.options('*', cors());

//Middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

//Routes
const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const categoriesRouter = require("./routers/categories");
const ordersRouter = require("./routers/orders");

const api = process.env.API_URL;

app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);

//Database
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });


//Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
