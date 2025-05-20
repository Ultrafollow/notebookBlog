// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export default NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID, // 从.env文件获取（需在GitHub注册OAuth App）
      clientSecret: process.env.GITHUB_SECRET, // GitHub生成的客户端密钥（保密！）
    }),
    // 可添加其他登录方式（如Google、邮箱密码等）
  ],
  secret: process.env.NEXTAUTH_SECRET, // 会话加密密钥（在.env中配置）
  session: { strategy: "jwt" }, // 使用JWT会话（无状态）
});