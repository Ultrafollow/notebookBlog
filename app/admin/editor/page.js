'use client'

import '@/app/globals.css';
import '@/app/prism-dracula.css';
import 'github-markdown-css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes'; 
import { getMDXComponent } from 'mdx-bundler/client';
import { TreeWrapper } from '@/components/Plugins/Antd';
import { Container } from '@/components/ui/Container';
import Editor from '@/components/Notes/Editor'; 
import { createClient } from '@/utils/supabase/client'; // 导入 Supabase 客户端
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation';
import { CheckKey } from '@/components/Author/CheckKey';
import matter from 'gray-matter'

export default function NotePage() {
  const { data: session } = useSession()

  const router = useRouter();
  console.log('router', router);
  const { resolvedTheme } = useTheme(); 
  const [error, setError] = useState(null);
  const [compiledCode, setCompiledCode] = useState(null);
  const [compileError, setCompileError] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  // 新增：保存相关状态
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentSlug, setCurrentSlug] = useState('');
  const [isContentModified, setIsContentModified] = useState(false);// 新增：内容修改状态
  const supabase = createClient(); // 初始化 Supabase 客户端

  const stableUpdateContent = useCallback((content) => {
    setEditorContent(content);
    setSaveSuccess(false); // 内容变化时重置保存成功状态
    setIsContentModified(true); // 内容变化时标记为未保存
  }, []);

  // 新增：保存到 Supabase 的函数
  const handleSave = useCallback(async () => {
    if (!session?.user?.id) {
      alert('请先登录后再保存');
      return;
    }

    let isAllowed = CheckKey({id: session.user.id});

    if (!isAllowed) {
      alert(`当前用户无保存权限，请附上你的用户ID：${session.user.id}，联系站长开放权限！`);
      return;
    }
    if (!editorContent.trim()) { // 内容为空时提示
      setError('内容不能为空');
      return;
    }
    const { data: metadata } = matter(editorContent);
    const slug = metadata.title
    .replace(/\s+/g, '-') // 空格转短横线
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '') // 保留单词字符、中文字符、短横线
    .replace(/--+/g, '-') // 合并连续短横线
    .replace(/^-+|-+$/g, ''); // 移除首尾短横线
    const category = prompt('请输入笔记分类（例如：技术、生活）：');
    if (category === null) { // 用户点击取消
      alert('已取消保存');
      return;
    }
    if (!category.trim()) { // 输入为空
      alert('分类不能为空');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      // 插入或更新逻辑（这里假设每次保存都新增记录，可根据需求改为更新）
      const { data, error: supabaseError } = await supabase
        .from('mdx_documents')
        .insert({ content: editorContent, user_id: session.user.id, category: category.trim(), title: slug }) // 插入新记录
        .select(); // 返回插入的数据

      if (supabaseError) throw new Error(supabaseError.message);
      setCurrentCategory(category.trim()); // 保存分类（已去空格）
      setCurrentSlug(slug); // 保存 slug
      setSaveSuccess(true); // 保存成功提示
      setIsContentModified(false); // 保存成功，重置修改状态
    } catch (err) {
      setError(`保存失败：${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [editorContent, supabase]);
  
  if (saveSuccess) {
    setTimeout(() => {
      setSaveSuccess(false); // 3秒后重置保存成功状态
      const postPath = `${currentCategory}/${currentSlug}`;
      router.push(`/admin/editor/${session.user.id}/${postPath}/edit`);
      // router.push(`/admin/editor/${session.user.id}`)
    }, 800);
  }
useEffect(() => {
  const handleBeforeUnload = (e) => {
      if (isContentModified) {
        e.preventDefault();
        e.returnValue = ''; // 触发浏览器默认提示
      }
    };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [isContentModified]);


useEffect(() => {
  let isHandling = false;
  const handlePopState = (e) => {
    if (!isContentModified || isHandling) return;

    isHandling = true;
    e.preventDefault();
    const confirmLeave = window.confirm('内容未保存，确定离开吗？');
    
    if (confirmLeave) {
      router.back();
    } else {
      // 取消后退并保持当前页面
      window.history.pushState(null, '', window.location.href);
      isHandling = false; // 重置处理状态
    }
  };

  // 添加初始历史记录
  window.history.pushState(null, '', window.location.href);
  
  window.addEventListener('popstate', handlePopState);
  
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}, [isContentModified]); // 正确添加依赖项

useEffect(() => {
  const handleClick = (e) => {
    const target = e.target.closest('a');
    if (!target || !isContentModified) return;

    // 阻止所有默认行为和冒泡
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const confirmLeave = window.confirm('内容未保存，确定离开吗？');
    if (confirmLeave) {
      // 统一使用 Next.js 路由跳转
      if (target.href.startsWith(window.location.origin)) {
        router.push(target.href.replace(window.location.origin, ''));
      } else {
        window.location.href = target.href; // 处理外部链接
      }
    }
  };

  // 使用捕获阶段确保优先处理
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}, [isContentModified, router]); // 添加 router 依赖

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
            content={editorContent? editorContent : '# 开始编辑'}
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