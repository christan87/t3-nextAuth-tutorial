// import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
//import { useSession } from "next-auth/react";
import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const filterUserForClient = (user: User) => {
  return {
    id: user.id, 
    username: user.name,
    profileImageUrl: user.image
  }
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
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
});
