import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, required: true },
  allChildren: [{ type: mongoose.Schema.Types.ObjectId, ref: "Child" }],
});

const userModel = mongoose.model("User", UserSchema);

export default userModel;
