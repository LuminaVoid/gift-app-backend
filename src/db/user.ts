import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { Timestamped } from "./common.js";

export interface IUser extends Timestamped {
  userId: number;
  username: string;
  firstName: string;
  lastName?: string;
  profilePic?: string;
  isPremium: boolean;
  theme: "light" | "dark";
  languageCode: "en" | "ru";
  receivedGiftCount: number;
}

export type IUserDoc = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      unique: false,
    },
    lastName: {
      type: String,
      required: false,
      unique: false,
    },
    profilePic: {
      type: String,
      required: false,
      unique: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ["ligh", "dark"],
      default: "light",
    },
    languageCode: {
      type: String,
      enum: ["en", "ru"],
      default: "en",
    },
    receivedGiftCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

UserSchema.index({ receivedGiftCount: -1 });

export default (mongoose.models["User"] as Model<IUser>) ??
  mongoose.model<IUser>("User", UserSchema);
