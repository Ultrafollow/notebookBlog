'use client'
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { GrowingUnderline } from '@/components/ui/Growing-underline';
import { Link } from '@/components/ui/Link';
import { HEADER_NAV_LINKS } from '@/data/navigation';
import { Logo } from './Logo';
import AnimatedThemeSwitch from './Switch';
import DocSearch from '@/components/Search/DocSearch';
import { useHeader } from './HeaderContext';

export function Header( { children }) {
  const pathname = usePathname();
  const { visible } = useHeader();
  if (!visible) return null;

  return (
    <Container
      as="header"
      className={clsx(
        'bg-[#FFFAF0]/75 py-2 backdrop-blur dark:bg-gray-800/75',
        'shadow-sm saturate-100 md:rounded-2xl',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Logo />
        <div className="flex items-center gap-4 max-h-5">
          <div className="hidden gap-1.5 sm:flex">
            <DocSearch />
            {HEADER_NAV_LINKS.map(({ title, href }) => {
              const isActive = pathname === href;
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
          <div className="flex items-center gap-4">
            {children}
            <AnimatedThemeSwitch />
          </div>
        </div>
      </div>
    </Container>
  );
}