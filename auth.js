import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
// import { generateStableId } from "@/app/lib/utils"


export const { handlers, auth, signIn, signOut } = NextAuth({ 
    providers: [ GitHub ],
    session:{
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
            // 登录时，把 GitHub id 存到 token
            token.uid = profile.id;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user && token?.uid) {
                session.user.id = String(token.uid); // 使用 GitHub id
            }
            return session
        },
    }
})
