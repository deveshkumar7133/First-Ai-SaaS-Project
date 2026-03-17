import { getUsageForUser } from "../models/Usage.js";

export async function getUsage(req, res) {
  try {
    const usage = await getUsageForUser(req.user.id);
    return res.json(usage);
  } catch {
    return res.status(500).json({ message: "Failed to get usage" });
  }
}
