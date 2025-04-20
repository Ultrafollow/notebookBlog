import { clsx } from 'clsx'
import { Image } from '@/components/ui/Image'
import { Link } from '@/components/ui/Link'
import { SITE_METADATA } from '@/data/site-metadata'
import { GrowingUnderline } from '@/components/ui/Growing-underline'

export function Logo(className) {
  return (
    <Link
      href="/"
      aria-label={SITE_METADATA.headerTitle}
      className={clsx([
        'flex items-center gap-2 rounded-xl p-2',
        className,
      ])}
    >
      <Image
        src="/static/images/logo.png"
        alt={SITE_METADATA.headerTitle}
        width={80}
        height={80}
        className="animate-bounce h-10 w-10 rounded-xl"
        loading="eager"
      />
      <GrowingUnderline
        className="font-greeting hover:'bg-[length:100%_50%]'"
      >
        FollowXu
      </GrowingUnderline>
    </Link>
  )
}
