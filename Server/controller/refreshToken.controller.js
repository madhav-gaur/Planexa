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
    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_TOKEN
    );
    if (!verifyToken) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    const userId = verifyToken?.id;
    const newAccessToken = await generatedAccessToken(userId);

    const cookieOption = {
      httpOnly: true,
      sameSite: "none",
      secure: true,
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
