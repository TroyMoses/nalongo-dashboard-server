import Leader from "../mongodb/models/leader.js";
import User from "../mongodb/models/user.js";

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllLeaders = async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
    name_like = "",
    leaderShipType = "",
  } = req.query;

  const query = {};

  if (leaderShipType !== "") {
    query.leaderShipType = leaderShipType;
  }

  if (name_like) {
    query.name = { $regex: name_like, $options: "i" };
  }

  try {
    const count = await Leader.countDocuments({ query });

    const leaders = await Leader.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

    res.status(200).json(leaders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderDetail = async (req, res) => {
  const { id } = req.params;
  const leaderExists = await Leader.findOne({ _id: id }).populate(
    "creator"
  );

  if (leaderExists) {
    res.status(200).json(leaderExists);
  } else {
    res.status(404).json({ message: "Leader not found" });
  }
};

const createLeader = async (req, res) => {
  try {
    const { name, description, leaderShipType, position, donations, photo, email } =
      req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findOne({ email }).session(session);

    if (!user) throw new Error("User not found");

    const photoUrl = await cloudinary.uploader.upload(photo);

    const newLeader = await Leader.create({
      name,
      description,
      leaderShipType,
      position,
      donations,
      photo: photoUrl.url,
      creator: user._id,
    });

    user.allLeaders.push(newLeader._id);
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({ message: "Leader created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, leaderShipType, position, donations, photo } =
      req.body;

    const photoUrl = await cloudinary.uploader.upload(photo);

    await Leader.findByIdAndUpdate(
      { _id: id },
      {
        name,
        description,
        leaderShipType,
        position,
        donations,
        photo: photoUrl.url || photo,
      }
    );

    res.status(200).json({ message: "Leader updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLeader = async (req, res) => {
  try {
    const { id } = req.params;

    const leaderToDelete = await Leader.findById({ _id: id }).populate(
      "creator"
    );

    if (!leaderToDelete) throw new Error("Leader not found");

    const session = await mongoose.startSession();
    session.startTransaction();

    leaderToDelete.remove({ session });
    leaderToDelete.creator.allLeaders.pull(childToDelete);

    await leaderToDelete.creator.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Leader deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllLeaders,
  getLeaderDetail,
  createLeader,
  updateLeader,
  deleteLeader,
};
