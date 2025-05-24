import { NextResponse } from 'next/server';
import { bundleMDX } from 'mdx-bundler';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrismPlus from 'rehype-prism-plus';
import remarkCodeTitles from 'remark-flexible-code-titles';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import path from 'path';

export async function POST(request) {
  try {
    const { mdxContent } = await request.json();

    // 使用mdx-bundler编译MDX（服务端执行）
    const { code } = await bundleMDX({
      source: mdxContent,
      cwd: path.join(process.cwd(), 'app', 'components', 'Plugins'), // 插件目录路径
      mdxOptions: (options) => {
        options.remarkPlugins = [
          ...(options.remarkPlugins || []),
          remarkGfm,
          remarkCodeTitles,
          [remarkMath, { singleDollarTextMath: true }]
        ];
        options.rehypePlugins = [
          ...(options.rehypePlugins || []),
          rehypeSlug,
          rehypeKatex,
          [rehypePrismPlus, { ignoreMissing: false, showLineNumbers: true }]
        ];
        return options;
      },
      esbuildOptions: (options) => {
        options.outdir = path.join(process.cwd(), 'public'); // 输出目录（可选）
        options.write = false;
        return options;
      }
    });

    return NextResponse.json({ code, error: null });
  } catch (error) {
    return NextResponse.json({ 
      code: null, 
      error: error instanceof Error ? error.message : '编译失败' 
    });
  }
}