import { APIResponse } from "../types.js";
import User, { IUser } from "../db/user.js";

export const handleUpdateUserSettings = async ({
  userId,
  languageCode,
  theme,
}: {
  userId: string;
  theme?: string;
  languageCode?: string;
}): Promise<APIResponse<IUser>> => {
  try {
    const setter: Record<string, string> = {};
    if (theme) {
      setter.theme = theme;
    }
    if (languageCode) {
      setter.languageCode = languageCode;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: setter },
      { lean: true }
    );
    return {
      status: "success",
      data: updatedUser,
    };
  } catch (error) {
    console.log("Failed to update user settings");
    console.error(error);
    return {
      status: "error",
      data: null,
    };
  }
};
