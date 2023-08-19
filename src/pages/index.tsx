import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from "next/image";
import { LoadingPage, LoadingSpinner} from "~/components/loading";
import { toast } from "react-hot-toast";
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
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if(errorMessage && errorMessage[0]){
        toast.error(errorMessage[0]);
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

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex border-b border-slate-400 p-4 gap-3" key={post.id}>
      <Image 
        className="w-14 h-14 rounded-full" 
        src={author.profileImageUrl!} 
        alt="Author Profile Image" 
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300"> 
          <Link href={`/@${author.username}`}><span>{`@${author.username}`}</span></Link>
          <Link href={`/post/${author.id}`}><span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if(postsLoading) return <LoadingPage />
  if(!data) return <div>Something Went Wrong...</div>

  return (
    <div className="flex flex-col ">
      {data?.map((fullPost, i) => (<PostView {...fullPost} key={fullPost.post.id}/>))}
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
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            <div className="flex justify-center w-full">
              {session && <CreatePostWizard />}
              {/*<button
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={session? () => void signOut() : () => void signIn()}
              >
                {session ? "Sign out" : "Sign in"}
              </button>*/}
            </div>
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}