import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateToken.js";
// ? Create User
export const userSignUp = async (req, res) => {
  try {
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
    console.log("BODY:", req.body);

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Provide name, email and password",
      });
    }
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(500).json({
        success: false,
        message: "User Alredy exists Please Sign in",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
// ? User Sign In

export const userSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Provide both email and password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User doesn't exists, Create an Account",
      });
    }
    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      return res.json({
        success: false,
        message: "Incorrect Email or Password",
      });
    }
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const cookieOption = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    res.cookie("accessToken", accessToken, cookieOption);
    res.cookie("refreshToken", refreshToken, cookieOption);

    return res.status(200).json({
      success: true,
      message: "Sign in Successfull",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Error: ${error.message}` || "Internal Server Error",
    });
  }
};
export const updateAvatar = async (req, res) => {
  try {
    const avatarUrl = req.file.path;
    console.log(req.file);
    console.log(avatarUrl);

    const user = await userModel
      .findByIdAndUpdate(req.userId, { avatar: avatarUrl }, { new: true })
      .select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      data: user,
      message: "Image Uploaded",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const userId = req.userId;

    await userModel.findByIdAndUpdate(userId, { name, email });

    return res.status(200).json({
      success: true,
      message: "User Details Updated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// export const template = async (req, res) => {
//   try {
//     return res.status(200).json({
//       success: true,
//       message: "",
//       data: "",
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };
