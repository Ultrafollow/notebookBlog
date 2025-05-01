'use client'
import { clsx } from 'clsx'
import { Image } from '@/components/ui/Image'
import { Link } from '@/components/ui/Link'
import { SITE_METADATA } from '@/data/site-metadata'
import { GrowingUnderline } from '@/components/ui/Growing-underline'
import { animate, createScope, createSpring, createDraggable } from 'animejs';
import { useEffect, useRef, useState } from 'react'
import { TITLE_PATH} from '@/components/ui/SvgPath'


export function Logo(className) {
  const root = useRef(null)
  const scope = useRef(null)
  useEffect(() => {
  
    scope.current = createScope({ root }).add( self => {
      animate('.logo', {
        scale: [
          { to: 1.25, ease: 'inOut(3)', duration: 200 },
          { to: 1, ease: createSpring({ stiffness: 300 }) }
        ],
        loop: true,
        loopDelay: 250,
      });
      // Make the logo draggable around its center
      createDraggable('.logo', {
        container: [0, 0, 0, 0],
        releaseEase: createSpring({ stiffness: 200 })
      });
    });
    return () => scope.current.revert()

  }, []);


  return (
    <div ref={root} className='flex items-center gap-2 rounded-xl p-2'>
      <Image
        src="/static/images/logo.png"
        alt={SITE_METADATA.headerTitle}
        width={80}
        height={80}
        className="logo h-10 w-10 rounded-xl"
        loading="eager"
      />
      <Link
        href="/"
        aria-label={SITE_METADATA.headerTitle}
      >
        <GrowingUnderline
          className="font-greeting hover:'bg-[length:100%_50%]'"
        >
          FollowXu
        </GrowingUnderline>
      </Link>
    </div>
  )
}
