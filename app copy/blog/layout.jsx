import Link from 'next/link'
import '@/app/globals.css'
import '@/app/prism-dracula.css'
import { getCategories } from '@/app/lib/utils'
import { registerPrismLanguages } from '@/app/lib/lang'

registerPrismLanguages()

export default async function BlogLayout({ children }) {
  const categories = await getCategories()

  return (
    <>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css"/>
      </head>
      <body className={'container mx-[auto] max-w-[80%]'}>
        {<nav className="mb-8 border-b pb-4 flex gap-4 items-center">
          <Link href="/" className="text-xl font-bold">首页</Link>
          <div className="flex gap-2">
            {categories.map(category => (
              <Link
                key={category}
                href={`/blog/${encodeURIComponent(category)}`}
                className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        </nav>}
        <div className="markdown-body mt-10">{children}</div>
      </body>
    </>
  )
}