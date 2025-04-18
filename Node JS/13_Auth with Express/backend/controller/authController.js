const userModel = require("../models/userSchema");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (!email || !name || !password || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Every field is required",
      });
    }

    var validEmail = emailValidator.validate(email);
    if (!validEmail) {
      res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Password & confirm password don't match",
      });
    }
    const userInfo = userModel(req.body);
    const result = await userInfo.save();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    if ((e.code = 11000)) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    res.status(400).json({
      succes: false,
      message: e.message,
    });
  }
};

// Sign IN controlller

const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Every field is required",
    });
  }
  try {
    const user = await userModel
      .findOne({
        email,
      })
      .select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const token = user.jwtToken();
    user.password = undefined;

    const cookieOptions = {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    };

    res.cookie("token", token, cookieOptions);
    res.status(200).json({
      success: true,
      message: `SignIn Successfull , Hello ${user.name}`,
      data: user,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// user details
const getUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    return res.status(200).json({
      success: true,
      data: `Hello ${user.name}, How are you today?`,
    });
  } catch {
    e;
  }
  {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// logout controller

const logout = (req, res) => {
  try {
    const cookieOptions = { expires: new Date(), httpOnly: true };

    res.cookie("token", null, cookieOptions);
    res.status(200).json({
      success: true,
      message: "Logged Out Successfully!",
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

module.exports = { signup, signin, getUser, logout };
