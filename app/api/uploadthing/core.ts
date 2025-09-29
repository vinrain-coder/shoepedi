import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "@/lib/get-session";

const f = createUploadthing();

export const ourFileRouter = {
  productImages: f({
    image: {
      maxFileSize: "1MB", // increase if needed
      maxFileCount: 6, // allow up to 10 images
    },
  })
    .middleware(async () => {
      const session = await getServerSession();
      if (!session) throw new UploadThingError("Unauthorized");
      return { userId: session?.user?.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // file here will be ONE of the uploaded files
      // UploadThing runs this callback for each file uploaded
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
