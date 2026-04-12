import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/generateToken.js";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken =
      req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    const verifyToken = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_TOKEN,
    );
    if (!verifyToken?.id) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    const userId = verifyToken.id;
    const newAccessToken = await generateAccessToken(userId);

    const cookieOption = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    res.cookie("accessToken", newAccessToken, cookieOption);
    return res.status(200).json({
      success: true,
      message: "New Access token generated",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message || error });
  }
};
