import ChapterDenmark from "../mongodb/models/chapter-denmark.js";
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

const getAllChapterDenmark = async (req, res) => {
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
    const count = await ChapterDenmark.countDocuments({ query });

    const chapterDenmark = await ChapterDenmark.find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

    res.status(200).json(chapterDenmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChapterDenmarkDetail = async (req, res) => {
  const { id } = req.params;
  const chapterDenmarkExists = await ChapterDenmark.findOne({ _id: id }).populate(
    "creator"
  );

  if (chapterDenmarkExists) {
    res.status(200).json(chapterDenmarkExists);
  } else {
    res.status(404).json({ message: "Chapter Denmark not found" });
  }
};

const createChapterDenmark = async (req, res) => {
  try {
    const { name, description, photo, email } =
      req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findOne({ email }).session(session);

    if (!user) throw new Error("User not found");

    const photoUrl = await cloudinary.uploader.upload(photo);

    const newChapterDenmark = await ChapterDenmark.create({
      name,
      description,
      photo: photoUrl.url,
      creator: user._id,
    });

    user.allChapterDenmark.push(newChapterDenmark._id);
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({ message: "Chapter Denmark created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateChapterDenmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, photo } =
      req.body;

    const photoUrl = await cloudinary.uploader.upload(photo);

    await ChapterDenmark.findByIdAndUpdate(
      { _id: id },
      {
        name,
        description,
        photo: photoUrl.url || photo,
      }
    );

    res.status(200).json({ message: "Chapter Denmark updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChapterDenmark = async (req, res) => {
  try {
    const { id } = req.params;

    const chapterDenmarkToDelete = await ChapterDenmark.findById({ _id: id }).populate(
      "creator"
    );

    if (!chapterDenmarkToDelete) throw new Error("Chapter Denmark not found");

    const session = await mongoose.startSession();
    session.startTransaction();

    chapterDenmarkToDelete.remove({ session });
    chapterDenmarkToDelete.creator.allChapterDenmark.pull(chapterDenmarkToDelete);

    await chapterDenmarkToDelete.creator.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Chapter Denmark deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllChapterDenmark,
  getChapterDenmarkDetail,
  createChapterDenmark,
  updateChapterDenmark,
  deleteChapterDenmark,
};
