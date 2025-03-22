"use client";
import { getS3Url, uploadToS3 } from "@/lib/s3";
import { Inbox } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

const FileUpload = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];

      if (file.size > 10 * 1024 * 1024) {
        //bigger than 10mb!
        alert("Please upload a smaller file");
        return;
      }
      try {
        const data = await uploadToS3(file);
        console.log("data", data);
        // console.log("File Url: " + getS3Url(data?.file_key.toString()));
      } catch (error) {
        console.log("Error in Uploading filr", error);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-2xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-300 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        <>
          <Inbox className="w-10 h-10 text-blue-950" />
          <p className="mt-2 text-sm text-slate-700">Drop PDF Here</p>
        </>
      </div>
    </div>
  );
};

export default FileUpload;
