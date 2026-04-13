import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateToken.js";
import { workspaceModel } from "../models/workspaceModel.js";
import { projectModel } from "../models/projectModel.js";
import { taskModel } from "../models/taskModel.js";

const cookieOption = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
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
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const existingUser = await userModel.findOne({
      email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { name, email }, { new: true })
      .select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      message: "User Details Updated",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Provide current, new, and confirm password",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }
    // if (newPassword.length < 6) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "New password must be at least 6 characters long",
    //   });
    // }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      refreshToken: "",
    });

    res.clearCookie("accessToken", cookieOption);
    res.clearCookie("refreshToken", cookieOption);

    return res.status(200).json({
      success: true,
      message: "Password updated.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const leaveWorkspace = async (req, res) => {
  try {
    const userId = req.userId;
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required",
      });
    }

    const workspace = await workspaceModel.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    if (workspace.adminId?.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Workspace admins cannot leave. Transfer ownership or delete the workspace first.",
      });
    }

    await Promise.all([
      workspaceModel.findByIdAndUpdate(workspaceId, {
        $pull: { members: userId },
      }),
      userModel.findByIdAndUpdate(userId, {
        $pull: { workspaces: { workspaceId } },
      }),
      projectModel.updateMany(
        { workspaceId },
        { $pull: { members: userId } },
      ),
      taskModel.updateMany(
        { workspaceId },
        { $pull: { assignees: userId } },
      ),
    ]);

    const updatedUser = await userModel
      .findById(userId)
      .select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      message: "Left workspace successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    const ownedWorkspaces = await workspaceModel.countDocuments({ adminId: userId });
    if (ownedWorkspaces > 0) {
      return res.status(400).json({
        success: false,
        message:
          "You still own one or more workspaces. Delete them or transfer ownership before deleting your account.",
      });
    }

    await Promise.all([
      workspaceModel.updateMany(
        { members: userId },
        { $pull: { members: userId } },
      ),
      projectModel.updateMany(
        { members: userId },
        { $pull: { members: userId } },
      ),
      projectModel.updateMany(
        { projectHeadId: userId },
        { $unset: { projectHeadId: 1 } },
      ),
      taskModel.updateMany(
        { assignees: userId },
        { $pull: { assignees: userId } },
      ),
      userModel.findByIdAndDelete(userId),
    ]);

    res.clearCookie("accessToken", cookieOption);
    res.clearCookie("refreshToken", cookieOption);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
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
