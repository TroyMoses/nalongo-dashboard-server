import express from "express";

import {
  createChapterDenmark,
  deleteChapterDenmark,
  getAllChapterDenmark,
  getChapterDenmarkDetail,
  updateChapterDenmark,
} from "../controllers/chapter-denmark.controller.js";

const router = express.Router();

router.route("/").get(getAllChapterDenmark);
router.route("/:id").get(getChapterDenmarkDetail);
router.route("/").post(createChapterDenmark);
router.route("/:id").patch(updateChapterDenmark);
router.route("/:id").delete(deleteChapterDenmark);

export default router;
