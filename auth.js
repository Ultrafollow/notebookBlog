import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { generateStableId } from "@/app/lib/utils"


export const { handlers, auth, signIn, signOut } = NextAuth({ 
    providers: [ GitHub ],
    session:{
        strategy: "jwt",
    },
    callbacks: {
        jwt: async ({ token }) => {
            return token
        },
        session: async ({ session, token }) => {
            if (session.user && token?.sub) {
                session.user.id = generateStableId(session.user.email)
            }
            return session
        },
  },
})
