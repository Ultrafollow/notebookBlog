'use client'
import '@/app/globals.css'
import '@/app/prism-dracula.css'
import 'github-markdown-css'
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { getMDXComponent } from 'mdx-bundler/client'
import { TreeWrapper } from '@/components/Plugins/Antd';
import { Container } from '@/components/ui/Container'
import Editor from '@/components/Notes/Editor';

export default function Notes() {
    const supabase = createClient();
    const [notes, setNotes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // 新增：存储API返回的编译结果和错误
    const [compiledCode, setCompiledCode] = useState(null);
    const [compileError, setCompileError] = useState(null);
    // 新增：编译过程中的加载状态
    const [isCompiling, setIsCompiling] = useState(false);
    const [editorContent, setEditorContent] = useState('');

    useEffect(() => {
        const fetchNotes = async () => {
        try {
            // 1. 从Supabase获取MDX内容
            const { data, error: supabaseError } = await supabase
            .from('mdx_documents')
            .select('*');
            
            if (supabaseError) throw supabaseError;
            setNotes(data);

            // 2. 如果有内容，调用API编译
            if (data?.[0]?.content) {
            setIsCompiling(true); // 开始编译，显示加载状态
            const content = data[0].content;

            // 3. 调用/api/mdx/compile接口
            const response = await fetch('/api/mdx/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mdxContent: content })
            });

            // 4. 解析API返回结果
            const { code, error: compileError } = await response.json();
            setCompiledCode(code); // 存储编译后的代码
            setCompileError(compileError); // 存储编译错误信息
            }

        } catch (err) {
            setError(err.message); // 捕获Supabase或网络错误
        } finally {
            setLoading(false);
            setIsCompiling(false); // 无论成功失败，结束编译加载状态
        }
        };

        fetchNotes();
    }, []);
    // 加载状态（Supabase数据 + 编译过程）
    if (loading || isCompiling) return <div>Loading...（可能在获取数据或编译中）</div>;

    // 错误提示（Supabase请求错误）
    if (error) return <div>Error: {error}</div>;

    // 无内容提示
    if (!notes?.length) return <div>No content found</div>;
        const MDXComponent = getMDXComponent(compiledCode)
    console.log('当前编辑器内容:', editorContent)
    return (
        <div>
            <div className='mt-20'>
                <Editor
                    onChange={setEditorContent}
                />
            </div>
            <div className='markdown-root'>
                <div className='markdown-body'>
                    <Container className='mb-[200px] max-w-[60%] py-8'>
                        <MDXComponent components={{
                            TreeWrapper
                        }}/>
                    </Container>
                </div>
            </div>
        </div>
    );
}