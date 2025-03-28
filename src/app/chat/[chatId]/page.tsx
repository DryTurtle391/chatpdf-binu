import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }
  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">{/* <ChatSideBar */}</div>
        {/* pdf viewer */}
        <div className="flex-[5] max-h-screen p-4 overflow-scroll">
          {/* PDF Viewer */}
        </div>
        {/* chat component */}
        <div className="flex-[3] border-1-4 border-1-slate-200">
          {/* Chat Component */}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
