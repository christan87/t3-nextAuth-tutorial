//import { useSession } from "next-auth/react";
import type { NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfileFeed = (props: {userId: string}) => {
  const {data, isLoading} = api.posts.getPostsByUserId.useQuery({userId: props.userId});
  if(isLoading) return <LoadingPage />
  if(!data || data.length === 0) return <div>User has not posted yet...</div>

  return(
    <div className="flex flex-col">
      {data.map((fullPost) => (<PostView {...fullPost} key={fullPost.post.id} />))}
    </div>
  )
}

const ProfilePage: NextPage<{username: string}> = ({username}) => {
  const {data: user} = api.profile.getUserByUserName.useQuery({username});
  if(!user) return <div>404</div>
  
  return (
    <>
      <Head>
        <title>{user.username}</title>
      </Head>
      <PageLayout>
        <div className=" relative h-36 bg-slate-600">
          <Image 
            src={user?.profileImageUrl ?? ""} 
            alt={`${user?.username ?? ""}'s profile pic`}
            width={128}
            height={128}
            className="-mb-[64px] rounded-full absolute bottom-0 left-0 ml-4 border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">{`@${user?.username}`}</div>
        <div className="border-b border-slate-400 w-full" />
        <ProfileFeed userId={user.id} />
      </PageLayout>
    </>
  );
}

import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import superjson from 'superjson';
import type { GetStaticProps } from "next";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx:{session: null, prisma, currentUser: undefined},
    transformer: superjson,
  });

  const slug = context.params?.slug;
  if(typeof slug !== "string") throw new Error("no slug");
  const username = slug.replace("@", "");
  await ssg.profile.getUserByUserName.prefetch({username});

  return({
    props:{
      trpcState: ssg.dehydrate(),
      username,
    }
  })
}

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"}
}

export default ProfilePage;