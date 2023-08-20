import type { User } from "@prisma/client";

export const filterUserForClient = (user: User) => {
    return {
      id: user.id, 
      username: user.name,
      profileImageUrl: user.image
    }
  }
