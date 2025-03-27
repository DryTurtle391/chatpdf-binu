import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeClient = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const index = pinecone.index(process.env.PINECONE_INDEX!);
  return index;
};

export async function loadS3IntoPinecone(fileKey: string) {}
