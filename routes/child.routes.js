import express from "express";

import {
  createChild,
  deleteChild,
  getAllChildren,
  getChildDetail,
  updateChild,
} from "../controllers/child.controller.js";

const router = express.Router();

router.route("/").get(getAllChildren);
router.route("/:id").get(getChildDetail);
router.route("/").post(createChild);
router.route("/:id").patch(updateChild);
router.route("/:id").delete(deleteChild);

export default router;
