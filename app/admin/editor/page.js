// app/note/page.jsx（假设路径）
'use client'

import '@/app/globals.css';
import '@/app/prism-dracula.css';
import 'github-markdown-css';
// import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes'; 
import { getMDXComponent } from 'mdx-bundler/client';
import { TreeWrapper } from '@/components/Plugins/Antd';
import { Container } from '@/components/ui/Container';
import Editor from '@/components/Notes/Editor'; // 引入修改后的 Editor 组件

export default function NotePage() {
  // const supabase = createClient();
  const { resolvedTheme } = useTheme(); 
  const [error, setError] = useState(null);
  const [compiledCode, setCompiledCode] = useState(null);
  const [compileError, setCompileError] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [editorContent, setEditorContent] = useState('# 开始编辑');

  // 稳定的更新内容回调（避免子组件不必要重渲染）
  const stableUpdateContent = useCallback((content) => {
    // 仅当内容变化时更新状态（避免重复触发）
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [editorContent]);

  // 编译逻辑（保持原有，但优化防抖）
  useEffect(() => {
    const compileMDX = async () => {
      try {
        if (!editorContent) return; // 空内容不编译
        
        setIsCompiling(true);
        const response = await fetch('/api/mdx/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mdxContent: editorContent })
        });

        const { code, error: compileError } = await response.json();
        setCompiledCode(code);
        setCompileError(compileError);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsCompiling(false);
      }
    };

    // 防抖 300ms（避免频繁输入触发过多请求）
    const timeout = setTimeout(compileMDX, 300);
    return () => clearTimeout(timeout);
  }, [editorContent]);

  if (error) return <div>Error: {error}</div>;

  const MDXComponent = compiledCode ? getMDXComponent(compiledCode) : null;
  console.log('当前编辑器内容:', editorContent);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex rounded-2xl shadow-md bg-white overflow-hidden">
        {/* 左侧编辑器区域（保持不变） */}
        <div className="w-1/2 p-6 border-r border-gray-100">
          <Editor
            value={editorContent} 
            getValue={stableUpdateContent}
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
            style={{
              minHeight: 'calc(100vh - 2rem)', // 与右侧高度同步
              width: '100%',
              borderRadius: '0.75rem',
              // backgroundColor: '#f8f9fa',
              padding: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.6'
            }}
          />
        </div>
 
        {/* 右侧预览区域（关键调整） */}
        <div className="w-1/2 p-2">
          {/* 外层容器：固定高度+滚动控制 */}
          <div 
            className="markdown-root"
            style={{
              height: 'calc(100vh - 2rem)', // 与左侧编辑器高度一致（减去外层p-4的影响）
              overflowY: 'auto', // 内容超出时显示垂直滚动条
              padding: '1rem' // 补充内边距（原p-2可能不够）
            }}
          > 
            <div className="markdown-body">
              <div className="max-w-4xl">
                {MDXComponent ? (
                  <Container className='mb-12 py-4'>
                    <MDXComponent components={{ TreeWrapper }} />
                  </Container>
                ) : (
                  <div className="text-center text-gray-500 mt-32">
                    {isCompiling ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></span>
                        <span>编译中...</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl font-light mb-2">📝 输入你的内容</p>
                        <p className="text-sm text-gray-400">支持Markdown语法，右侧将实时预览效果</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}