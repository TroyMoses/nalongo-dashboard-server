import express from "express";

import {
  createChapterGermany,
  deleteChapterGermany,
  getAllChapterGermany,
  getChapterGermanyDetail,
  updateChapterGermany,
} from "../controllers/chapter-germany.controller.js";

const router = express.Router();

router.route("/").get(getAllChapterGermany);
router.route("/:id").get(getChapterGermanyDetail);
router.route("/").post(createChapterGermany);
router.route("/:id").patch(updateChapterGermany);
router.route("/:id").delete(deleteChapterGermany);

export default router;
