import clsx from 'clsx'
 
export function Container({
  children,
  as: Component = 'section',
  className
}) {
  return (
    <Component className={clsx(
      'mx-auto w-full max-w-7xl px-4 sm:px-6 xl:px-12',
      className
    )}>
      {children}
    </Component>
  )
}