import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
// import Image from "next/image";
import { LogIn } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload";
import { chats } from "@/lib/db/schema";
import { desc, eq, InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  let latestChat: InferSelectModel<typeof chats>[] = [];
  console.log(userId, isAuth);
  if (isAuth) {
    latestChat = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.id))
      .limit(1);
  }
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <div className="flex justify-center items-center pt-2">
              <UserButton />
            </div>
          </div>
          <div className="flex mt-8">
            {isAuth && latestChat?.length != 0 && (
              <Link
                href={`/chat/${latestChat[0].id}`}
                className="cursor-pointer"
              >
                <Button>Go to Chats</Button>
              </Link>
            )}
          </div>
          <p className="max-w-xl mt-2 text-lg text-black-600">
            Join millions of students, researchers and professionals to
            instantly answer questions and underdstand research with AI
          </p>

          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Sign in to Get Started
                  <LogIn className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
