import mongoose from "mongoose";

const ChildSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  childId: { type: String, required: true },
  gender: { type: String, required: true },
  description: { type: String, required: true },
  levelOfNeed: { type: String, required: true },
  nationality: { type: String, required: true },
  parentStatus: { type: String, required: true },
  grade: { type: String, required: true },
  donations: { type: Number, required: true },
  yearsLeftToGraduate: { type: Number, required: true },
  photo: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const childModel = mongoose.model("Child", ChildSchema);

export default childModel;
