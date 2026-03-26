import jwt from "jsonwebtoken";
// ? userAuth

export const auth = (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No access token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN);

    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "jwt expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
