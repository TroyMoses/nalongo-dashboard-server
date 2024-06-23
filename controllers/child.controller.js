import Child from "../mongodb/models/child.js";
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

const getAllChildren = async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
    name_like = "",
    levelOfNeed = "",
  } = req.query;

  const query = {};

  if (levelOfNeed !== "") {
    query.levelOfNeed = levelOfNeed;
  }

  if (name_like) {
    query.name = { $regex: name_like, $options: "i" };
  }

  try {
    const count = await Child.countDocuments({ query });

    const children = await Child.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChildDetail = async (req, res) => {
  const { id } = req.params;
  const childExists = await Child.findOne({ _id: id }).populate(
    "creator",
  );

  if (childExists) {
    res.status(200).json(childExists);
  } else {
    res.status(404).json({ message: "Child not found" });
  }
};

const createChild = async (req, res) => {
  try {
    const { name, description, levelOfNeed, grade, donations, photo, email } =
      req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findOne({ email }).session(session);

    if (!user) throw new Error("User not found");

    const photoUrl = await cloudinary.uploader.upload(photo);

    const newChild = await Child.create({
      name,
      description,
      levelOfNeed,
      grade,
      donations,
      photo: photoUrl.url,
      creator: user._id,
    });

    user.allChildren.push(newChild._id);
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({ message: "Child created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateChild = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, levelOfNeed, grade, donations, photo } =
      req.body;

    const photoUrl = await cloudinary.uploader.upload(photo);

    await Child.findByIdAndUpdate(
      { _id: id },
      {
        name,
        description,
        levelOfNeed,
        grade,
        donations,
        photo: photoUrl.url || photo,
      },
    );

    res.status(200).json({ message: "Child updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChild = async (req, res) => {
  try {
    const { id } = req.params;

    const childToDelete = await Child.findById({ _id: id }).populate(
      "creator",
    );

    if (!childToDelete) throw new Error("Child not found");

    const session = await mongoose.startSession();
    session.startTransaction();

    childToDelete.remove({ session });
    childToDelete.creator.allChildren.pull(childToDelete);

    await childToDelete.creator.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Child deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllChildren,
  getChildDetail,
  createChild,
  updateChild,
  deleteChild,
};
