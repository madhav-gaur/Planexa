import crypto from "crypto";
import dotenv from "dotenv"
dotenv.config()
const SECRET = process.env.INVITE_SECRET;

export const generateInviteLink = (workspaceId, role) => {
  const payload = `${workspaceId}:${role}`;
  const hash = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

  return Buffer.from(`${payload}:${hash}`).toString("base64");
};
