import crypto from "crypto"
export const verifyInviteHash = (token) => {
  console.log("token", token);
  const decoded = Buffer.from(token, "base64").toString();
  const [workspaceId, role, hash] = decoded.split(":");

  const expectedHash = crypto
    .createHmac("sha256", process.env.INVITE_SECRET)
    .update(`${workspaceId}:${role}`)
    .digest("hex");

  if (hash !== expectedHash) {
    throw new Error("Invalid invite link");
  }

  return { workspaceId, role };
};
