import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from "next/image";
import { LoadingPage, LoadingSpinner} from "~/components/loading";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { data : session } = useSession();
  const user = session?.user;
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate(); // without void this will not deploy
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content?.[0];
      if(errorMessage){
        toast.error(errorMessage);
      }else{
        toast.error("Failed to post! Please try again later.")
      }
    }
  });
  const [input, setInput] = useState("");
  if(!user) return null;
  return (
    <div className="flex w-full gap-3">
      <Image 
        className="w-14 h-14 rounded-full" 
        src={user.image!} 
        alt="profile image"
        width={56}
        height={56}
      />
      <input 
        placeholder="Type some emojis!"
        className="bg-transparent grow outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if(e.key === "Enter"){
            e.preventDefault();
            if(input !== "") {
              mutate({content: input});
            }
          }
        }}
      />
      {input !== "" && !isPosting && (<button onClick={() => mutate({content: input})} disabled={isPosting} >Post</button>)}
      {isPosting && <div className="flex justify-center items-center"><LoadingSpinner size={20} /></div>}
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if(postsLoading) return <LoadingPage />
  if(!data) return <div>Something Went Wrong...</div>

  return (
    <div className="flex flex-col ">
      {data?.map((fullPost) => (<PostView {...fullPost} key={fullPost.post.id}/>))}
    </div>
  );
}

export default function Home() {
  const { data : session,  } = useSession();
  api.posts.getAll.useQuery();
  const user = session?.user;

  if(!user) return <div className="flex justify-center items-center h-screen">
    <button 
      className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
      onClick={() => void signIn()}
    >
      Sign In
    </button>
  </div>

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {session && <CreatePostWizard />}
          {/*<button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={session? () => void signOut() : () => void signIn()}
          >
            {session ? "Sign out" : "Sign in"}
          </button>*/}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
}