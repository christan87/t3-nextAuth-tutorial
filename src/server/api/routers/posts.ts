import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
//import { useSession } from "next-auth/react";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import type { Post } from "@prisma/client";
import { prisma } from "~/server/db";

const addUserDataToPosts = async (posts: Post[]) => {
  const authorIds = posts.map((post) => post.authorId);
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: authorIds
      }
    },
    take: 100,
  });
  
  return posts.map((post) => {
    const author = users.map(filterUserForClient).find((user) => user.id === post.authorId);
    if(!author){
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found"
      })
    }
    return{
      post,
      author
    }
  });
}

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */ 
  prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{createdAt: 'desc'}]
    });
    return addUserDataToPosts(posts)
  }),

  getPostById: publicProcedure.input(z.object({
    id: z.string()
  })).query(async ({ctx, input}) => {
    const post = await ctx.prisma.post.findUnique({
      where: {
        id: input.id
      },
    });
    console.log("id:", `"${input.id}"`)
    if(!post) throw new TRPCError({code: "NOT_FOUND"});
    return (await addUserDataToPosts([post]))[0];
  }),

  getPostsByUserId: publicProcedure.input(z.object({
    userId: z.string()
  })).query(({ctx, input}) => ctx.prisma.post.findMany({
    where:{
      authorId: input.userId
    },
    take: 100,
    orderBy: [{ createdAt: "desc" }]
  }).then(addUserDataToPosts)),

  create: privateProcedure.input(z.object({content: z.string().emoji("Only emojis are allowed").min(1).max(280)})).mutation(async({ctx, input}) => {
    const authorId = ctx.currentUser.id

    const { success } = await ratelimit.limit(authorId);
    if(!success) throw new TRPCError({code: "TOO_MANY_REQUESTS"})
    const post = await ctx.prisma.post.create({
      data:{
        authorId,
        content: input.content
      }
    });
    return post
  }),
});
