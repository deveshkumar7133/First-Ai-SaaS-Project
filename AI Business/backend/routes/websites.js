import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createWebsite, exportWebsite, getWebsite, listWebsites, updateWebsite, regenerateWebsite } from "../controllers/websitesController.js";

const router = Router();

router.post("/websites", requireAuth, createWebsite);
router.get("/websites", requireAuth, listWebsites);
router.get("/websites/:id", requireAuth, getWebsite);
router.patch("/websites/:id", requireAuth, updateWebsite);
router.post("/websites/:id/regenerate", requireAuth, regenerateWebsite);
router.get("/websites/:id/export", requireAuth, exportWebsite);

export default router;

