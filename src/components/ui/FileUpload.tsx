"use client";
import { /* getS3Url, */ uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];

      if (file.size > 10 * 1024 * 1024) {
        //bigger than 10mb!
        toast.error("File too large");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong");
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
          },
          onError: (error) => {
            toast.error("Error in creating chat: " + error);
            console.error("ERROR IN CREATING CHAT: ", error);
          },
        });
        console.log("data", data);
        // console.log("File Url: " + getS3Url(data?.file_key.toString()));
      } catch (error) {
        console.log("Error in Uploading file", error);
      } finally {
        setUploading(false);
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
        {uploading || isPending ? (
          <>
            {/* loading state */}
            <Loader2 className="h-10 w-10 text-blue-950 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Analyzing Document...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-950" />
            <p className="mt-2 text-sm text-slate-700">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
