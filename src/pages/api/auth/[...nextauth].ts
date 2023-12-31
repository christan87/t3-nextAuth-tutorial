import NextAuth, {type NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env.mjs";
import { prisma } from "../../../server/db";

export const authOptions: NextAuthOptions = {
    // Include user .id on session
    callbacks:{
        session({session, user}) {
            if(session.user) {
                session.user.id = user.id
            }
            return session;
        },
    },
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
        // ... add more providers here
    ],
    debug: true,
};
export default NextAuth(authOptions);


//Set the Prisma adapter as a top-level option, not within the callbacks
// export default NextAuth({
//     ...authOptions,
//     adapter: PrismaAdapter(prisma),
// });


/* --------------Original File--------------
import NextAuth from "next-auth";
import { authOptions } from "~/server/auth";

export default NextAuth(authOptions);
*/

/* --------------Updated File--------------
import NextAuth, {type NextAuthOptions} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env.mjs";
import { prisma } from "../../../server/db";

export const authOptions: NextAuthOptions = {
    // Include user .id on session
    callbacks:{
        session({session, user}) {
            if(session.user) {
                session.user.id = user.id
            }
            return session;
        },
    },
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        // ... add more providers here
    ],
};

export default NextAuth(authOptions);
*/ 