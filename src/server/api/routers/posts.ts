import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { useSession } from "next-auth/react";
import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const filterUserForClient = (user: User) => {
  return {
    id: user.id, 
    username: user.name,
    profileImageUrl: user.image
  }
}

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

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
    const authorIds = posts.map((post) => post.authorId);
    const users = await ctx.prisma.user.findMany({
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
  }),

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
