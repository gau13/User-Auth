const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

mongoose
  .connect("mongodb://127.0.0.1:27017/Backend")
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

const users = [];

// Using Middlewares
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Setting up view engine
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const decoded = jwt.verify(token, "ssdssfsedwef");

    console.log("-------------isauth");
    console.log(decoded);

    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.redirect("/login");
  }
};
app.get("/", isAuthenticated, (req, res) => {
  // console.log(req.cookies).token;
  console.log("------------/");
  console.log(req.user);

  res.render("logout", { name: req.user.name });
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    res.redirect("/register");
  }

  const isMatch = user.password === password;
  if (!isMatch) {
    return res.render("login", { email, message: "Incorrrect password" });
  }
  const token = jwt.sign({ _id: user._id }, "ssdssfsedwef");
  console.log("-----------/login,token");
  console.log(token);

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 2000),
  });
  res.redirect("/");
});
app.post("/register", async (req, res) => {
  // console.log("------------/login");
  // console.log(req.body);

  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    // return console.log("Register now");
    return res.redirect("/login");
  }
  user = await User.create({
    name,
    email,
    password,
  });

  const token = jwt.sign({ _id: user._id }, "ssdssfsedwef");
  console.log("-----------/login,token");
  console.log(token);

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 2000),
  });
  res.redirect("/");
});
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000, () => console.log("Server started"));
