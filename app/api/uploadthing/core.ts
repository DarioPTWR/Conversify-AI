/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import { pinecone } from "@/lib/pinecone";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      console.log("Running middleware...");

      const { getUser } = getKindeServerSession();
      const user = getUser();

      if (!user || !(await user).id) {
        console.error("Unauthorized access in middleware");
        throw new Error("Unauthorized");
      }

      console.log("User authenticated with ID:", (await user).id);
      return { userId: (await user).id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete, processing file...");

      if (!file.url) {
        console.error("Uploadthing did not provide a file.url");
        throw new Error("File URL is missing in upload response");
      }

      console.log("Creating file entry in the database...");
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://utfs.io/f/${file.key}`,
          uploadStatus: "PROCESSING",
        },
      });

      console.log("File created in DB with ID:", createdFile.id);

      try {
        console.log(`Fetching file from URL: https://utfs.io/f/${file.key}`);
        const response = await fetch(`https://utfs.io/f/${file.key}`);

        if (!response.ok) {
          console.error("Failed to fetch the file from the URL.");
          throw new Error("Failed to fetch the file from the URL.");
        }

        const blob = await response.blob();
        console.log("File fetched, loading PDF content...");

        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        console.log(`PDF loaded with ${pageLevelDocs.length} pages`);

        const pineconeIndex = pinecone.Index("nexus");

        console.log("Vectorizing pages and storing in Pinecone...");
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OpenAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });

        console.log("Successfully indexed document in Pinecone");

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });

        console.log("File upload status updated to SUCCESS");
      } catch (err) {
        console.error("Error processing PDF or indexing:", err);

        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });

        console.log("File upload status updated to FAILED");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
