import { auth } from "auth"
import { createClient } from '@/utils/supabase/server';

export default async function userPage () {
  const session = await auth()
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mdx_documents')
    .select('content, updated_at')
    .eq('user_id', session.user.id) // 根据用户 ID 查询数据
    .order('updated_at', { ascending: false })
  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }
  if (!data || data.length === 0) {
    return <div>该用户还没有保存任何内容</div>
  }

    return (
        <div className="p-4">
        <h2 className="text-xl font-bold mb-4">用户 {session.user.name} 的文档列表</h2>
        <ul className="space-y-2">
            {data.map((doc, index) => (
            <li
                key={index}
                className="border p-3 rounded-lg"
            >
                <div className="text-sm text-gray-500 mb-2">
                修改时间：{new Date(doc.updated_at).toLocaleString()}
                </div>
                <div className="text-base">
                {doc.content.length > 200 
                    ? `${doc.content.slice(0, 200)}...` // 截断长内容
                    : doc.content}
                </div>
            </li>
            ))}
        </ul>
        </div>
  )
}