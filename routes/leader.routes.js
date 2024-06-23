import express from "express";

import {
  createLeader,
  deleteLeader,
  getAllLeaders,
  getLeaderDetail,
  updateLeader,
} from "../controllers/leader.controller.js";

const router = express.Router();

router.route("/").get(getAllLeaders);
router.route("/:id").get(getLeaderDetail);
router.route("/").post(createLeader);
router.route("/:id").patch(updateLeader);
router.route("/:id").delete(deleteLeader);

export default router;
