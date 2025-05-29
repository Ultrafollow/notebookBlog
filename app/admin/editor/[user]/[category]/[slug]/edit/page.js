'use client'

import '@/app/globals.css';
import '@/app/prism-dracula.css';
import 'github-markdown-css';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes'; 
import { getMDXComponent } from 'mdx-bundler/client';
import { TreeWrapper } from '@/components/Plugins/Antd';
import { Container } from '@/components/ui/Container';
import Editor from '@/components/Notes/Editor2'; 
import { createClient } from '@/utils/supabase/client'; 
import { useSession } from "next-auth/react";
import { usePathname } from 'next/navigation'; 
import { useRouter } from 'next/navigation'; // 新增：用于跳转
import matter from 'gray-matter'

export default function NotePage() {
  const { data: session } = useSession();
  const router = useRouter(); // 新增：路由实例
  const { resolvedTheme } = useTheme(); 
  const [error, setError] = useState(null);
  const [compiledCode, setCompiledCode] = useState(null);
  const [compileError, setCompileError] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 新增：加载状态
  const [isInitialized, setIsInitialized] = useState(false); // 新增：初始化状态
  const pathname = usePathname(); 
  const pathSegments = pathname
    .replace(/^\//, '')
    .split('/')
    .filter(segment => segment !== '');

  // 提取路径参数（确保路径结构为：/admin/editor/[user_id]/[category]/[slug]）
  const userId = pathSegments[2] ? decodeURIComponent(pathSegments[2]) : '';
  const category = pathSegments[3] ? decodeURIComponent(pathSegments[3]) : '';
  const title = pathSegments[4] ? decodeURIComponent(pathSegments[4]) : '';

  // 新增：存储查询到的内容和初始化编辑器内容
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const supabase = createClient(); 


  // 稳定更新编辑器内容的回调
  const stableUpdateContent = useCallback((content) => {
    setEditorContent(content);
    setSaveSuccess(false); 
  }, []);

  // 新增：从 Supabase 查询匹配的文档内容
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 校验路径参数是否完整
        if (!userId || !category || !title) {
          throw new Error('路径参数不完整，无法加载内容');
        }

        // 查询匹配 user_id、category、title 的文档
        const { data, error: supabaseError } = await supabase
          .from('mdx_documents')
          .select('content') // 仅需 content 字段
          .eq('user_id', userId)
          .eq('category', category)
          .eq('title', title)
          .single();

        if (supabaseError) throw new Error(supabaseError.message);
        if (!data) throw new Error('未找到匹配的文档');

        // 初始化编辑器内容
        stableUpdateContent(data.content);
        setIsInitialized(true)
      } catch (err) {
        setError(`加载内容失败：${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [userId, category, title, supabase]);

  // 新增：更新逻辑（替换原保存逻辑）
  const handleUpdate = useCallback(async () => {
    if (!editorContent.trim()) {
      setError('内容不能为空');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // 根据路径参数更新匹配的文档
      const { data: metadata } = matter(editorContent);
          const slug = metadata.title
          .replace(/\s+/g, '-') // 空格转短横线
          .replace(/[^\w\u4e00-\u9fa5-]+/g, '') // 保留单词字符、中文字符、短横线
          .replace(/--+/g, '-') // 合并连续短横线
          .replace(/^-+|-+$/g, ''); // 移除首尾短横线
      const { data, error: supabaseError } = await supabase
        .from('mdx_documents')
        .update({ content: editorContent, title: slug }) // 仅更新 content 字段
        .eq('user_id', userId)
        .eq('category', category)
        .eq('title', title)
        .select();

      if (supabaseError) throw new Error(supabaseError.message);
      setSaveSuccess(true); // 更新成功提示
    } catch (err) {
      setError(`更新失败：${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [editorContent, supabase, userId, category, title]);

  // 新增：删除逻辑
  const handleDelete = useCallback(async () => {
    const confirmDelete = confirm('确定要删除这篇笔记吗？删除后无法恢复！');
    if (!confirmDelete) return;

    setIsSaving(true);
    setError(null);

    try {
      // 根据路径参数删除匹配的文档
      const { error: supabaseError } = await supabase
        .from('mdx_documents')
        .delete()
        .eq('user_id', userId)
        .eq('category', category)
        .eq('title', title);

      if (supabaseError) throw new Error(supabaseError.message);
      router.push(`/admin/editor/${userId}`); // 删除后跳转回用户编辑器列表
    } catch (err) {
      setError(`删除失败：${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [router, supabase, userId, category, title]);

  // 保存成功后跳转（原逻辑调整）
  if (saveSuccess) {
    setTimeout(() => {
      setSaveSuccess(false);
      router.push(`/admin/editor/${session.user.id}`)
    }, 2000);
  }

  // 编译逻辑（保持原有）
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const compileMDX = async () => {
      try {
        if (!editorContent) return;
        setIsCompiling(true);
        const response = await fetch('/api/mdx/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mdxContent: editorContent }),
          signal: abortController.signal,
        });

        if (isMounted && response.ok) {
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
      clearTimeout(timeout);
      abortController.abort();
      isMounted = false;
    };
  }, [editorContent]);

  // 加载状态和错误处理
  if (isLoading) return <div className="p-4 text-center">加载内容中...</div>;
  if (error) return <div className="p-4 text-red-600">错误：{error}</div>;

  const MDXComponent = compiledCode ? getMDXComponent(compiledCode) : null;

  return (
    <div className="mt-8 min-h-screen rounded-2xl bg-gray-50 p-4 dark:bg-gray-700">
      {/* 操作按钮区域（更新和删除） */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={handleUpdate}
          disabled={isSaving || !editorContent.trim()}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:bg-blue-300 transition-colors"
        >
          {isSaving ? '更新中...' : '更新笔记'}
        </button>
        <button
          onClick={handleDelete}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg bg-red-500 text-white disabled:bg-red-300 transition-colors"
        >
          {isSaving ? '删除中...' : '删除笔记'}
        </button>
        {saveSuccess && (
          <span className="text-green-500">更新成功 ✔️</span>
        )}
      </div>

      {/* 编辑器和预览区域 */}
      <div className="flex rounded-2xl shadow-md bg-white overflow-hidden dark:bg-[#1f1f1f] dark:shadow-lg dark:shadow-cyan-500/50">
        <div className="w-1/2 p-6 border-r border-gray-100">
          {isInitialized && (
            <Editor
              getValue={stableUpdateContent}
              content={editorContent}
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
          )}
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