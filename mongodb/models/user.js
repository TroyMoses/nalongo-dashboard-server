import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, required: true },
  allChildren: [{ type: mongoose.Schema.Types.ObjectId, ref: "Child" }],
  allLeaders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Leader" }],
  allChapterDenmark: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChapterDenmark" }],
  allChapterGermany: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChapterGermany" }],
  allChapterSwitzerland: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChapterSwitzerland" }],
});

const userModel = mongoose.model("User", UserSchema);

export default userModel;
