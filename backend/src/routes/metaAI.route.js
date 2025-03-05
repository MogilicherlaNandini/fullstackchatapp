import express from "express";
import { getMetaAIResponse } from "../controllers/metaAI.controller.js";

const router = express.Router();

router.post("/metaai", getMetaAIResponse);

export default router;