import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  // 忽略文件配置
  {
    ignores: [
      'tailwind.config.js',
      '.next/**',
      'node_modules/**'
    ]
  },

  // ESLint 推荐规则
  js.configs.recommended,

  // 扩展配置
  ...compat.extends(
    'plugin:jsx-a11y/recommended',    // 可访问性检查
    'next',                           // Next.js 默认规则
    'next/core-web-vitals'            // Web Vitals 相关规则
  ),

  // 全局规则配置
  {
    languageOptions: {
      globals: {
        ...globals.browser,  // 浏览器全局变量
        ...globals.node,     // Node.js 全局变量
        React: 'readable'    // 允许使用 JSX
      },
      parserOptions: {
        ecmaVersion: 2022,   // 支持最新 ECMAScript 特性
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true          // 启用 JSX 支持
        }
      }
    },

    rules: {
      // 代码格式化
      'prettier/prettier': 'error',

      // React 相关
      'react/react-in-jsx-scope': 'off',  // Next.js 自动处理 React 导入
      'react/prop-types': 'off',          // JS 项目不需要 prop-types

      // 可访问性
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['hrefLeft', 'hrefRight'],
          aspects: ['invalidHref', 'preferButton']
        }
      ],

      // 变量相关
      'no-unused-vars': 'warn',          // 未使用变量警告而非错误
      'no-redeclare': 'error',           // 禁止重复声明

      // 最佳实践
      'no-var': 'error',                // 强制使用 let/const
      'prefer-const': 'error',           // 优先使用 const
      'eqeqeq': ['error', 'always'],     // 强制 === 和 !==

      // 代码风格
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'indent': ['error', 2],
      'comma-dangle': ['error', 'never']
    }
  }
];