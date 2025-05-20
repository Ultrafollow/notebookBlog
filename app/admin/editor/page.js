'use client'

import '@/app/globals.css';
import '@/app/prism-dracula.css';
import 'github-markdown-css';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes'; 
import { getMDXComponent } from 'mdx-bundler/client';
import { TreeWrapper } from '@/components/Plugins/Antd';
import { Container } from '@/components/ui/Container';
import Editor from '@/components/Notes/Editor'; 

export default function NotePage() {
  const { resolvedTheme } = useTheme(); 
  const [error, setError] = useState(null);
  const [compiledCode, setCompiledCode] = useState(null);
  const [compileError, setCompileError] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [editorContent, setEditorContent] = useState('# 开始编辑');
  const [abortController, setAbortController] = useState(null); // 新增：存储AbortController实例

  const stableUpdateContent = useCallback((content) => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [editorContent]);

  useEffect(() => {
    const compileMDX = async () => {
      // 取消之前未完成的请求（如果有）
      if (abortController) abortController.abort();
      
      const newAbortController = new AbortController();
      setAbortController(newAbortController);

      try {
        if (!editorContent) return;
        
        setIsCompiling(true);
        const response = await fetch('/api/mdx/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mdxContent: editorContent }),
          signal: newAbortController.signal, // 关联取消信号
        });

        // 检查请求是否被取消（避免处理已取消的响应）
        if (response.ok) {
          const { code, error: compileError } = await response.json();
          setCompiledCode(code);
          setCompileError(compileError);
        }
      } catch (err) {
        // 忽略因取消导致的错误（AbortError）
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsCompiling(false);
        // 清除已完成的控制器
        setAbortController(null);
      }
    };

    const timeout = setTimeout(compileMDX, 300);
    return () => {
      clearTimeout(timeout);
      // 组件卸载时取消未完成的请求
      if (abortController) abortController.abort();
    };
  }, [editorContent, abortController]); // 依赖abortController确保取消逻辑更新

  if (error) return <div className="p-4 text-red-600">错误：{error}</div>;

  const MDXComponent = compiledCode ? getMDXComponent(compiledCode) : null;

  return (
    <div className="mt-8 min-h-screen rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
      <div className="flex rounded-2xl shadow-md bg-white overflow-hidden dark:bg-[#1f1f1f] dark:shadow-lg dark:shadow-cyan-500/50">
        {/* 左侧编辑器区域（保持不变） */}
        <div className="w-1/2 p-6 border-r border-gray-100">
          <Editor
            value={editorContent} 
            getValue={stableUpdateContent}
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
            style={{
              minHeight: 'calc(100vh - 2rem)',
              width: '100%',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.6'
            }}
          />
        </div>
 
        <div className="w-1/2 p-2">
          <div 
            className="markdown-root"
            style={{
              height: 'calc(100vh - 2rem)',
              overflowY: 'auto',
              padding: '1rem'
            }}
          > 
            <div className="markdown-body">
              <div className="max-w-4xl">
                {MDXComponent ? (
                  <Container>
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
                        <p className="text-sm text-gray-400">仅支持Markdown语法，右侧将实时预览效果</p>
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