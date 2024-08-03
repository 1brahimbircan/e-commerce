const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isAdmin = require("../helpers/isAdmin");

// Get all users - Admin Dashboard
router.get(`/`, isAdmin, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(userList);
});

// Get user details - User & Admin Dashboard
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user)
    return res
      .status(500)
      .json({ message: "The user with the given ID was not found." });

  res.status(200).send(user);
});

// Create user - Admin Dashboard
router.post(`/`, isAdmin, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();

  if (!user) {
    return res.status(400).send("the user cannot be created!");
  }
  res.send(user);
});

// Update user - Admin Dashboard
router.put("/:id", isAdmin, async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});

// User Login
router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.SECRET_KEY;

  if (!user) {
    return res.status(400).send("The user not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1m" }
    );

    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("The password is wrong");
  }
});

// User Register
router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});

// Delete user - Admin Dashboard
router.delete("/:id", isAdmin, (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

// Get user count - Admin Dashboard
router.get(`/get/count`, isAdmin, async (req, res) => {
  const userCount = await User.countDocuments({});

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

router.post('/verify-token', (req, res) => {
  const token = req.body.token; // Token'ı body'den al

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token must be provided' });
  }

  const secret = process.env.SECRET_KEY;

  try {
    const decoded = jwt.verify(token, secret);
    res.status(200).json({ success: true, userId: decoded.userId, isAdmin: decoded.isAdmin });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
