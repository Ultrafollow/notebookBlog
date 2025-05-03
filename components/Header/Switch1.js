'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { createTimeline } from 'animejs'

const EYE_PATHS = {
  openLeft: "M60 30C60 46.5685 46.5685 60 30 60C13.4315 60 0 46.5685 0 30C0 13.4315 13.4315 0 30 0C46.5685 0 60 13.4315 60 30Z",
  closedLeft: "M60 0.0002C60 16.5687 46.5685 30.0002 30 30.0002C13.4315 30.0002 0 16.5687 0 0.0002C0 0.0002 13.4315 5.5 30 5.5C46.5685 5.5 60 0.0002 60 0.0002Z",
  openRight: "M208 31C208 47.5685 194.569 61 178 61C161.431 61 148 47.5685 148 31C148 14.4315 161.431 1 178 1C194.569 1 208 14.4315 208 31Z",
  closedRight: "M208 1C208 17.5685 194.569 31 178 31C161.431 31 148 17.5685 148 1C148 1 161.431 9 178 9C194.569 9 208 1 208 1Z"
}

const MOUTH_PATHS = {
  open: "M77 60H130V73.5C130 88.1355 118.136 100 103.5 100C88.8645 100 77 88.1355 77 73.5V60Z",
  closed: "M77 30H130V30.3375C130 30.7034 118.136 31 103.5 31C88.8645 31 77 30.7034 77 30.3375V30Z"
}

export default function AnimatedThemeSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Refs
  const faceRef = useRef(null)
  const switchBGRef = useRef(null)
  const eyeLeftRef = useRef(null)
  const eyeRightRef = useRef(null)
  const mouthRef = useRef(null)
  const isAnimating = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 初始化位置和样式
  useEffect(() => {
    if (!mounted || isAnimating.current) return
    
    const isDark = resolvedTheme === 'dark'

    if (switchBGRef.current) {
      switchBGRef.current.style.backgroundColor = isDark 
        ? 'rgb(91,56,115)'
        : 'rgb(255,117,165)'
    }
  }, [mounted, resolvedTheme])

  const handleThemeToggle = () => {
    if (isAnimating.current) return
    isAnimating.current = true

    const currentIsDark = resolvedTheme === 'dark'
    const newTheme = currentIsDark ? 'light' : 'dark'

    const tl = createTimeline({
      easing: 'easeOutExpo',
      duration: 1050,
      onComplete: () => {
        isAnimating.current = false
        setTheme(newTheme) // 动画完成后更新主题状态
      }
    })

    // 使用 ref 直接控制元素
    tl.add(faceRef.current, {
      translateX: currentIsDark ? 50 : -1,
      rotate: currentIsDark ? 360 : -360,
      backgroundColor: currentIsDark ? 'rgb(243,255,148)' : 'rgb(110,240,225)'
    }, 500)
    
    .add(switchBGRef.current, {
      backgroundColor: currentIsDark 
        ? 'rgb(255,117,165)'
        : 'rgb(91,56,115)'
    }, '-=500')
    
    .add(eyeLeftRef.current, {
      d: [{ value: currentIsDark 
        ? EYE_PATHS.openLeft 
        : EYE_PATHS.closedLeft }]
    }, '-=800')
    
    .add(eyeRightRef.current, {
      d: [{ value: currentIsDark 
        ? EYE_PATHS.openRight 
        : EYE_PATHS.closedRight }]
    }, '-=800')
    
    .add(mouthRef.current, {
      d: [{ value: currentIsDark 
        ? MOUTH_PATHS.open 
        : MOUTH_PATHS.closed }]
    }, '-=800')

    return () => t1.revert()
  }

  return (
    <div 
      ref={switchBGRef}
      className="switchBG relative h-10 w-20 rounded-[100px] shadow-switch transition-colors duration-300"
    >
      <div
        ref={faceRef}
        className="face absolute left-0 top-0 h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-300"
        onClick={handleThemeToggle}
        role="button"
        aria-label="Toggle theme"
      >
        <svg 
          viewBox="0 0 208 100"
          className="w-[70%] h-[70%]"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={mouthRef}
            className="mouth"
            d={MOUTH_PATHS.open}
            fill="#E76060"
          />
          <path
            ref={eyeLeftRef}
            className="eye-left"
            d={EYE_PATHS.openLeft}
            fill="#474747"
          />
          <path
            ref={eyeRightRef}
            className="eye-right"
            d={EYE_PATHS.openRight}
            fill="#474747"
          />
        </svg>
      </div>
    </div>
  )
}