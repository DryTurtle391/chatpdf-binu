import {
  Pinecone,
  IntegratedRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";

import md5 from "md5";
import { Vector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data";
import { convertToAscii } from "./utils";

export const getPineconeClient = async () => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(file_key: string) {
  // 1. Obtain the pdf -->  download and read the pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(file_key);
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  //2. Split the doc into smaller segments by paragraph
  //pages=Array(10)
  const documents = await Promise.all(pages.map(prepareDocument));
  //documents = Array(100)

  //3. Vectorise and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  console.log("VECTOR EMBEDDINGS: ", vectors);

  // 4. Upload to Pincone
  const client = await getPineconeClient();
  const pineconeIndex = client.index(
    process.env.PINECONE_INDEX!,
    process.env.PINECONE_INDEX_HOST!
  );

  const namespace = convertToAscii(file_key);

  await pineconeIndex.namespace(namespace).upsert(
    vectors.map((item) => ({
      id: item.id,
      values: item.values,
      metadata: item.metadata as RecordMetadata,
    }))
  );

  return documents[0];
}

export async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
  } catch (error) {
    console.error("Error embedding documents", error);
    throw error;
  }
}

export const truncateStringByByte = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  //split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByByte(pageContent, 36000),
      },
    }),
  ]);

  return docs;
}
