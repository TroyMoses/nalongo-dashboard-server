import express from "express";

import {
  createChapterSwitzerland,
  deleteChapterSwitzerland,
  getAllChapterSwitzerland,
  getChapterSwitzerlandDetail,
  updateChapterSwitzerland,
} from "../controllers/chapter-switzerland.controller.js";

const router = express.Router();

router.route("/").get(getAllChapterSwitzerland);
router.route("/:id").get(getChapterSwitzerlandDetail);
router.route("/").post(createChapterSwitzerland);
router.route("/:id").patch(updateChapterSwitzerland);
router.route("/:id").delete(deleteChapterSwitzerland);

export default router;
