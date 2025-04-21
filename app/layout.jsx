import { Nunito, Ma_Shan_Zheng, Titan_One } from 'next/font/google'
import clsx from "clsx";
import '@/app/globals.css'
import '@/app/twemoji.css'
import { TiltedGridBackground } from '@/components/ui/Title-grid-background.js'
import { ThemeProviders } from './theme-providers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const FONT_PLAYPEN_SANS = Titan_One({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
  variable: '--font-titan-one',
})

const chineseFont = Ma_Shan_Zheng({
  // subsets: ['chinese-simplified'], 
  subsets:['latin'],
  weight: '400', 
  display: 'swap',
  variable: '--font-cn-body',
})

// 配置英文字体（Nunito）
const englishFont = Nunito({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'], // 选择常用字重
  variable: '--font-en-body',
})

export default function RootLayout({ children }) {
  return (
    <html 
    lang="en"
    className={clsx(
      'scroll-smooth',
      chineseFont.variable,
      englishFont.variable,
      FONT_PLAYPEN_SANS.variable
    )}
    suppressHydrationWarning
    >
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
      <body
        className={clsx([
          'antialiased',
          'relative min-h-screen pl-[calc(100vw-100%)]',
          'flex flex-col',
          'bg-white text-neutral-900',
          'dark:bg-dark dark:text-gray-100',
        ])}
      >
        <TiltedGridBackground className="inset-x-0 top-0 z-[-1] h-[50vh]" />
        <ThemeProviders>
          <Header/>
          <main className="mb-auto grow">
            {children}
          </main>
          <Footer/>
        </ThemeProviders>
      </body>
    </html>
  )
}