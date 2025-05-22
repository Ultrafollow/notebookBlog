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
import { createClient } from '@/utils/supabase/client'; // 导入 Supabase 客户端
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation';
import { s } from 'hastscript';

export default function NotePage() {
  const { data: session } = useSession()
  const router = useRouter();
  const { resolvedTheme } = useTheme(); 
  const [error, setError] = useState(null);
  const [compiledCode, setCompiledCode] = useState(null);
  const [compileError, setCompileError] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  // 新增：保存相关状态
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const supabase = createClient(); // 初始化 Supabase 客户端

  const stableUpdateContent = useCallback((content) => {
    setEditorContent(content);
    setSaveSuccess(false); // 内容变化时重置保存成功状态
  }, []);

  // 新增：保存到 Supabase 的函数
  const handleSave = useCallback(async () => {
    if (!editorContent.trim()) { // 内容为空时提示
      setError('内容不能为空');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // 插入或更新逻辑（这里假设每次保存都新增记录，可根据需求改为更新）
      const { data, error: supabaseError } = await supabase
        .from('mdx_documents')
        .insert({ content: editorContent, user_id: session.user.id }) // 插入新记录
        .select(); // 返回插入的数据

      if (supabaseError) throw new Error(supabaseError.message);
      setSaveSuccess(true); // 保存成功提示
    } catch (err) {
      setError(`保存失败：${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [editorContent, supabase]);
  
  if (saveSuccess) {
    setTimeout(() => {
      setSaveSuccess(false); // 3秒后重置保存成功状态
      router.push(`/admin/editor/${session.user.id}`)
    }, 800);
  }

  useEffect(() => {
  const abortController = new AbortController(); // 内部生成，不通过 state 管理
  let isMounted = true; // 防止组件卸载后更新状态
 
  const compileMDX = async () => {
    try {
      if (!editorContent) return; // 无内容时不请求
      setIsCompiling(true);
      const response = await fetch('/api/mdx/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mdxContent: editorContent }),
        signal: abortController.signal, // 使用内部生成的 abortController
      });
 
      if (isMounted && response.ok) { // 组件未卸载时更新状态
        const { code, error: compileError } = await response.json();
        setCompiledCode(code);
        setCompileError(compileError);
      }
    } catch (err) {
      if (isMounted && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      if (isMounted) {
        setIsCompiling(false);
      }
    }
  };
 
  const timeout = setTimeout(compileMDX, 800);
 
  return () => {
    clearTimeout(timeout); // 清理定时器
    abortController.abort(); // 取消未完成的请求
    isMounted = false; // 组件卸载时标记
  };
}, [editorContent]); // 仅依赖 editorContent（内容变化时触发）

  if (error) return <div className="p-4 text-red-600">错误：{error}</div>;

  const MDXComponent = compiledCode ? getMDXComponent(compiledCode) : null;

  return (
    <div className="mt-8 min-h-screen rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
      {/* 新增：保存按钮区域 */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !editorContent.trim()}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:bg-blue-300 transition-colors"
        >
          {isSaving ? '保存中...' : '保存笔记'}
        </button>
        {saveSuccess && (
          <span className="text-green-500">保存成功 ✔️</span>
        )}
      </div>

      <div className="flex rounded-2xl shadow-md bg-white overflow-hidden dark:bg-[#1f1f1f] dark:shadow-lg dark:shadow-cyan-500/50">
        {/* 左侧编辑器区域 */}
        <div className="w-1/2 p-6 border-r border-gray-100">
          <Editor
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

        {/* 右侧预览区域（保持不变） */}
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