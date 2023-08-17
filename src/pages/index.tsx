//import { signIn, signOut, useSession } from "next-auth/react";
import { useSession } from "next-auth/react";
import Head from "next/head";
//import Link from "next/link";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from "next/image";
import { LoadingPage} from "~/components/loading";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { data : session } = useSession();
  const user = session?.user;
  if(!user) return null;
  return (
    <div className="flex w-full gap-3">
      <Image 
        className="w-14 h-14 rounded-full" 
        src={user!.image!} 
        alt="profile image"
        width={56}
        height={56}
      />
      <input 
        placeholder="Type some emojis!"
        className="bg-transparent grow outline-none"
      />
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
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`· 1 ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
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
      {[...data, ...data]?.map((fullPost, i) => (<PostView {...fullPost} key={`${fullPost.post.id}${i}`}/>))}
    </div>
  );
}

export default function Home() {
  const { data : session,  } = useSession();
  api.posts.getAll.useQuery();
  const user = session?.user;

  if(!user) return <div />

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