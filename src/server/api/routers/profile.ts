import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { useSession } from "next-auth/react";
import type { User } from "@prisma/client";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const profileRouter = createTRPCRouter({
    getUserByUserName: publicProcedure.input(z.object({username: z.string()})).query(async ({ctx, input}) => {
        const [user] = await prisma.user.findMany({
            where: {
                name: input.username
            }
        });
        if(!user){
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "User not found"
            })
        }
        return filterUserForClient(user);
    }),
});
