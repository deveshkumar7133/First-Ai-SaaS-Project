import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { generateContent } from "../controllers/generateController.js";
import { generateFromPrompt } from "../controllers/generatePromptController.js";

const router = Router();

router.post("/generate-content", requireAuth, generateContent);
router.post("/generate-from-prompt", requireAuth, generateFromPrompt);

export default router;

