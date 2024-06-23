import ChapterSwitzerland from "../mongodb/models/chapter-switzerland.js";
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

const getAllChapterSwitzerland = async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
    name_like = "",
  } = req.query;

  const query = {};

  if (name_like) {
    query.name = { $regex: name_like, $options: "i" };
  }

  try {
    const count = await ChapterSwitzerland.countDocuments({ query });

    const chapterSwitzerland = await ChapterSwitzerland.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

    res.status(200).json(chapterSwitzerland);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChapterSwitzerlandDetail = async (req, res) => {
  const { id } = req.params;
  const chapterSwitzerlandExists = await ChapterSwitzerland.findOne({ _id: id }).populate(
    "creator"
  );

  if (chapterSwitzerlandExists) {
    res.status(200).json(chapterSwitzerlandExists);
  } else {
    res.status(404).json({ message: "Chapter Switzerland not found" });
  }
};

const createChapterSwitzerland = async (req, res) => {
  try {
    const { name, description, photo, email } =
      req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findOne({ email }).session(session);

    if (!user) throw new Error("User not found");

    const photoUrl = await cloudinary.uploader.upload(photo);

    const newChapterSwitzerland = await ChapterSwitzerland.create({
      name,
      description,
      photo: photoUrl.url,
      creator: user._id,
    });

    user.allChapterSwitzerland.push(newChapterSwitzerland._id);
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({ message: "Chapter Switzerland created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateChapterSwitzerland = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, photo } =
      req.body;

    const photoUrl = await cloudinary.uploader.upload(photo);

    await ChapterSwitzerland.findByIdAndUpdate(
      { _id: id },
      {
        name,
        description,
        photo: photoUrl.url || photo,
      }
    );

    res.status(200).json({ message: "Chapter Switzerland updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChapterSwitzerland = async (req, res) => {
  try {
    const { id } = req.params;

    const chapterSwitzerlandToDelete = await ChapterSwitzerland.findById({ _id: id }).populate(
      "creator"
    );

    if (!chapterSwitzerlandToDelete) throw new Error("Chapter Switzerland not found");

    const session = await mongoose.startSession();
    session.startTransaction();

    chapterSwitzerlandToDelete.remove({ session });
    chapterSwitzerlandToDelete.creator.allChapterSwitzerland.pull(chapterSwitzerlandToDelete);

    await chapterSwitzerlandToDelete.creator.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Chapter Switzerland deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllChapterSwitzerland,
  getChapterSwitzerlandDetail,
  createChapterSwitzerland,
  updateChapterSwitzerland,
  deleteChapterSwitzerland,
};
