import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
// import { PageProps } from "../../../../.next/types/app/layout";

interface PageProps {
  params: Promise<{
    chatId: string;
  }>;
}
/* type Props = Promise<{
  params: {
    chatId: string;
  };
}>; */

const ChatPage = async (props: PageProps) => {
  const { params } = props;
  const { chatId } = await params;
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

  const currentChat = _chats.find((chat) => chat.id == parseInt(chatId));
  return (
    <div className="flex max-h-screen">
      <div className="flex w-full max-h-screen">
        {/* chat sidebar */}
        <div className="flex-[3] overflow-scroll">
          {<ChatSideBar chats={_chats} chatId={parseInt(chatId)} />}
        </div>
        {/* pdf viewer */}
        <div className="flex-[5] max-h-screen p-4 overflow-scroll">
          <PDFViewer pdfUrl={currentChat?.pdfUrl || ""} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-1-4 border-1-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
