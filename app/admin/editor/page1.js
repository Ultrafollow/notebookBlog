// app/note/page.jsx（假设路径）
'use client'

import '@/app/globals.css';
import '@/app/prism-dracula.css';
import 'github-markdown-css';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { getMDXComponent } from 'mdx-bundler/client';
import { TreeWrapper } from '@/components/Plugins/Antd';
import { Container } from '@/components/ui/Container';
import Editor from '@/components/Notes/Editor'; // 引入修改后的 Editor 组件

export default function NotePage() {
  const supabase = createClient();
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

  const MDXComponent = getMDXComponent(compiledCode);
  console.log('当前编辑器内容:', editorContent);

  return (
    <div>
      <div className='mt-20'>
        {/* 传递 value 用于初始化，但后续更新由 ref 控制 */}
        <Editor
          value={editorContent} // 初始内容
          getValue={stableUpdateContent} // 内容变化时通知父组件
        />
      </div>
      <div className='markdown-root'>
        <div className='markdown-body'>
          <Container className='mb-[200px] max-w-[60%] py-8'>
            <MDXComponent components={{ TreeWrapper }} />
          </Container>
        </div>
      </div>
    </div>
  );
}