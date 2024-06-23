import ChapterGermany from "../mongodb/models/chapter-germany.js";
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

const getAllChapterGermany = async (req, res) => {
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
    const count = await ChapterGermany.countDocuments({ query });

    const chapterGermany = await ChapterGermany.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

    res.status(200).json(chapterGermany);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChapterGermanyDetail = async (req, res) => {
  const { id } = req.params;
  const chapterGermanyExists = await ChapterGermany.findOne({ _id: id }).populate(
    "creator"
  );

  if (chapterGermanyExists) {
    res.status(200).json(chapterGermanyExists);
  } else {
    res.status(404).json({ message: "Chapter Germany not found" });
  }
};

const createChapterGermany = async (req, res) => {
  try {
    const { name, description, photo, email } =
      req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findOne({ email }).session(session);

    if (!user) throw new Error("User not found");

    const photoUrl = await cloudinary.uploader.upload(photo);

    const newChapterGermany = await ChapterGermany.create({
      name,
      description,
      photo: photoUrl.url,
      creator: user._id,
    });

    user.allChapterGermany.push(newChapterGermany._id);
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({ message: "Chapter Germany created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateChapterGermany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, photo } =
      req.body;

    const photoUrl = await cloudinary.uploader.upload(photo);

    await ChapterGermany.findByIdAndUpdate(
      { _id: id },
      {
        name,
        description,
        photo: photoUrl.url || photo,
      }
    );

    res.status(200).json({ message: "Chapter Germany updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChapterGermany = async (req, res) => {
  try {
    const { id } = req.params;

    const chapterGermanyToDelete = await ChapterGermany.findById({ _id: id }).populate(
      "creator"
    );

    if (!chapterGermanyToDelete) throw new Error("Chapter Germany not found");

    const session = await mongoose.startSession();
    session.startTransaction();

    chapterGermanyToDelete.remove({ session });
    chapterGermanyToDelete.creator.allChapterGermany.pull(chapterGermanyToDelete);

    await chapterGermanyToDelete.creator.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Chapter Germany deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllChapterGermany,
  getChapterGermanyDetail,
  createChapterGermany,
  updateChapterGermany,
  deleteChapterGermany,
};
