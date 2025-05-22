import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
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
                session.user.id = token.sub
            }
            return session
        },
  },
})
