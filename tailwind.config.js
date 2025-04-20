/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",    // 匹配 app 目录下所有文件
        "./components/**/*.{js,ts,jsx,tsx}",
        './pages/**/*.{js,ts,tsx}',
        "./content/**/*.{md,mdx}",            // 匹配 Markdown 内容文件
        './Layouts/**/*.{js,ts,tsx}',
      ],
    darkMode: 'class',
    theme: {
      extend: {
        keyframes: {
          'pulse-opacity': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
          },
        },
        animation: {
          pulse: 'pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        },
        colors: {
          primary: colors.indigo,
          dark: '#1f1f1f',
          gray: colors.neutral,
          linkedin: '#0077B5',
        },
        fontFamily: {
          sans: [
            'var(--font-en-body)',
            'var(--font-cn-body)',
            ...fontFamily.sans
          ],
          greeting: ['var(--font-titan-one)'],
        },
        boxShadow: {
          demure: 'rgba(0, 0, 0, 0.3) 0 35px 60px -15px',
          'book-pages': `10px 40px 40px -10px #00000030, inset -2px 0 0 gray,
                          inset -3px 0 0 #dbdbdb, inset -4px 0 0 white, inset -5px 0 0 #dbdbdb,
                          inset -6px 0 0 white, inset -7px 0 0 #dbdbdb, inset -8px 0 0 white,
                          inset -9px 0 0 #dbdbdb`,
          mondegreen: `5px 5px rgba(0, 98, 90, 0.4),
                        10px 10px rgba(0, 98, 90, 0.3),
                        15px 15px rgba(0, 98, 90, 0.2),
                        20px 20px rgba(0, 98, 90, 0.1),
                        25px 25px rgba(0, 98, 90, 0.05)`,
        },
        typography: ({ theme }) => ({
          DEFAULT: {
            css: {
              'h1 a, h2 a, h3 a': {
                color: `${theme('colors.black')} !important`,
                textDecoration: 'none !important',
                '&:hover': {
                  color: `${theme('colors.black')} !important`,
                  textDecoration: 'underline !important'
                  }
               },
              a: {
                color: theme('colors.primary.500'),
                'text-underline-offset': '4px',
                '&:hover': {
                  color: `${theme('colors.primary.600')}`,
                },
              },
              'h1,h2,h3,h4,h5,h6': {
                scrollMarginTop: '6rem',
              },
              'h1,h2': {
                fontWeight: '700',
                letterSpacing: theme('letterSpacing.tight'),
              },
              h3: {
                fontWeight: '600',
              },
              hr: { borderColor: theme('colors.gray.200') },
              figure: {
                marginTop: 0,
              },
            },
          },
          invert: {
            css: {
              'h1 a, h2 a, h3 a': {
                color: theme('colors.white') + ' !important',
              },
              a: {
                color: theme('colors.primary.400'),
                '&:hover': {
                  color: `${theme('colors.primary.400')}`,
                },
                code: { color: theme('colors.primary.400') },
              },
              'h1,h2,h3,h4,h5,h6': {
                color: theme('colors.gray.100'),
              },
            },
          },
        }),
      },
    },
    plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}