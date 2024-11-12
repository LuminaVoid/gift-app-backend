import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { CommandContext, Context } from "grammy";
import path from "path";

const s3Client = new S3Client({
  endpoint: process.env.BUCKET_ENDPOINT,
  forcePathStyle: false,
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY,
  },
});

export const getUserProfilePhoto = async (
  ctx: CommandContext<Context>
): Promise<string | null> => {
  try {
    const profilePhotos = await ctx.getUserProfilePhotos({ limit: 1 });
    let profilePic = null;
    if (profilePhotos.total_count !== 0) {
      const smallestPic = profilePhotos.photos[0].reduce(
        (smallest, cur) => {
          if (cur.file_size && cur.file_size < smallest.fileSize) {
            return { fileSize: cur.file_size, id: cur.file_id };
          }
          if (cur.file_size === undefined) {
            return { fileSize: Infinity, id: cur.file_id };
          }
          return smallest;
        },
        { fileSize: Infinity, id: "" }
      );
      profilePic = smallestPic.id;
    }
    return profilePic;
  } catch (error) {
    return null;
  }
};

export const uploadProfilePhoto = async (
  ctx: CommandContext<Context>,
  fileId: string,
  userId: number
): Promise<string | null> => {
  try {
    const fileData = await ctx.api.getFile(fileId);
    if (!fileData.file_path) throw Error("no file_path");
    const fileExtension = path.extname(fileData.file_path);
    const fileStream = await fetch(
      `https://api.telegram.org/file/bot${process.env.TG_BOT_TOKEN}/${fileData.file_path}`
    );
    const fileBuffer = await fileStream.arrayBuffer();
    const fileName = `pp-${userId}${fileExtension}`;
    const data = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(fileBuffer),
        ACL: "public-read",
      })
    );
    if (data.$metadata.httpStatusCode === 200) {
      return `${process.env.BUCKET_CDN_ENDPOINT}/${fileName}`;
    }
    return null;
  } catch (error) {
    console.log("uploadProfilePhoto failed");
    console.error(error);
    return null;
  }
};
