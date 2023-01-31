import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { emotionCache } from '../core/emotionCache'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{ colorScheme: 'dark' }}
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
