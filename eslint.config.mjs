import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js"; // 新增核心规则配置

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended, // 添加 ESLint 推荐规则
  ...compat.extends("next/core-web-vitals"),
  // 新增自定义规则配置
  {
    files: ["*.js", "*.jsx"],
    rules: {
      "react/no-unescaped-entities": "off" // 关闭该规则
    }
  }
];