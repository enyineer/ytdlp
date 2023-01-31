import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { emotionCache } from '../core/emotionCache'
import { Righteous } from '@next/font/google'
import { Josefin_Sans } from '@next/font/google'

const headingsFont = Righteous({
  weight: '400',
  subsets: ['latin']
});

const font = Josefin_Sans({
  subsets: ['latin']
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: 'dark',
        fontFamily: font.style.fontFamily,
        headings: {
          fontFamily: headingsFont.style.fontFamily
        }
      }}
      emotionCache={emotionCache}
    >
      <NotificationsProvider>
        <ModalsProvider>
          <Component {...pageProps} />
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  )
}
