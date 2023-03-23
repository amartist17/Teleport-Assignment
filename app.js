const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blogModel");
const User = require("./models/userModel");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "static")));

const createSendToken = (user, res) => {
  try {
    id = user._id;
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    let cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    // console.log(cookieOptions);
    res.cookie("jwt", token, cookieOptions);
    user.password = undefined;
    res.status(201).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
  // res.redirect("/");
};

app.post("/signup", async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newUser, res);
  } catch (err) {
    return res.json({
      status: 400,
      err,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({
        status: "Failure",
        message: "Provide both email and password",
      });

    let user = await User.findOne({ username }).select("+password");

    if (!user || !(await user.passwordCheck(password, user.password)))
      return res.status(401).json({
        status: "Failure",
        message: "Invalid username or password'",
      });

    createSendToken(user, res);
  } catch (error) {
    res.json({
      status: "Failure",
      message: error,
    });
  }
});

app.post("/logout", async (req, res) => {
  try {
    res.cookie("jwt", "Logged Out", {
      expires: new Date(Date.now() + 10 * 10),
      httpOnly: true,
    });
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    res.json({
      status: "Failure",
      message: error,
    });
  }
});

app.post("/create-blog", async (req, res) => {
  try {
    let newBlog = await Blog.create(req.body);
    res.send(newBlog);
  } catch (error) {
    res.json({
      status: "Failure",
      message: error,
    });
  }
});

app.get("/blogs", async (req, res) => {
  try {
    let blogs = await Blog.find();
    res.send(blogs);
  } catch (error) {
    res.json({
      status: "Failure",
      message: error,
    });
  }
});

app.get("/blog/:id", async (req, res) => {
  try {
    let blog = await Blog.findOne({ _id: req.params.id });
    res.send(blog);
  } catch (error) {
    res.json({
      status: "Failure",
      message: error,
    });
  }
});

app.patch("/update-blog/:id", async (req, res) => {
  try {
    let updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body);
    res.send(updatedBlog);
  } catch (error) {
    res.json({
      status: "Failure",
      message: error,
    });
  }
});

app.delete("/delete-blog/:id", async (req, res) => {
  try {
    await Blog.deleteOne({ _id: req.params.id });
    res.send("Deleted");
  } catch (error) {
    res.json({
      status: "Failure",
      message: error,
    });
  }
});

module.exports = app;
