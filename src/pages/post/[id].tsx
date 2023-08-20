import { useSession } from "next-auth/react";
import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useRouter } from 'next/router';

const SinglePostPage: NextPage = () => {
  const { data : session,  } = useSession();
  const user = session?.user;
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div className="flex flex-col items-center">
          <div>Post View</div>
          {user && <div>{`${user.name}'s Post`}</div>}
          <button className=" mt-3 bg-slate-400 hover:bg-transparent duration-300 rounded-md" onClick={() => router.back()}>Go back</button>
        </div>
      </main>
    </>
  );
}

export default SinglePostPage;