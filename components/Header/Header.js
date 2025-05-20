'use client'

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { GrowingUnderline } from '@/components/ui/Growing-underline';
import { Link } from '@/components/ui/Link';
import { HEADER_NAV_LINKS } from '@/data/navigation';
import { SITE_METADATA } from '@/data/site-metadata';
import { Logo } from './Logo';
import AnimatedThemeSwitch from './Switch';
import DocSearch from '@/components/Search/DocSearch';
import { useHeader } from './HeaderContext';
// 新增：NextAuth相关导入
import { useSession, signIn, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession(); // 获取当前会话状态（已登录/未登录）
  const pathname = usePathname();
  const { visible } = useHeader();
  if (!visible) return null;

  return (
    <Container
      as="header"
      className={clsx(
        'bg-[#FFFAF0]/75 py-2 backdrop-blur dark:bg-gray-800/75',
        'shadow-sm saturate-100 md:rounded-2xl',
        SITE_METADATA.stickyNav && 'sticky top-2 z-50 lg:top-3'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Logo />
        <div className="flex items-center gap-4 max-h-5">
          <div className="hidden gap-1.5 sm:flex">
            <DocSearch />
            {HEADER_NAV_LINKS.map(({ title, href }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link key={title} href={href} className="px-3 py-1 font-medium">
                  <GrowingUnderline
                    className={clsx(isActive && 'bg-[length:100%_50%]')}
                  >
                    {title}
                  </GrowingUnderline>
                </Link>
              );
            })}
          </div>
          <div
            data-orientation="vertical"
            role="separator"
            className="hidden h-4 w-px shrink-0 bg-gray-200 dark:bg-gray-600 md:block"
          />
          <div className="flex items-center gap-2">
            <AnimatedThemeSwitch />
            {/* 新增：登录/退出按钮区域 */}
            {session?.user ? (
              // 已登录：显示用户信息和退出按钮
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })} // 退出后跳转主页
                  className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  退出登录
                </button>
              </div>
            ) : (
              // 未登录：显示登录按钮
              <button
                onClick={() => signIn('github')} // 触发GitHub登录（可替换为其他提供商）
                className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}