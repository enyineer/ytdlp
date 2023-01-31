import Head from 'next/head'
import { ActionIcon, Button, Container, Flex, Group, Paper, Text, TextInput, ThemeIcon, Title, Tooltip, UnstyledButton } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { z } from 'zod'
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { IconBrandFacebook, IconBrandInstagram, IconBrandSoundcloud, IconBrandYoutube, IconDots } from '@tabler/icons-react';
import DownloadProgress from '../components/DownloadProgress';
import { open as openDisclaimerModal } from '../components/DisclaimerModal';
import { open as openSupportedSitesModal } from '../components/SupportedSitesModal';
import ResourceUsage from '../components/ResourceUsage';
import Logo from '../../graphics/Logo.svg';
import Image from 'next/image';

const schema = z.object({
  url: z.string().url('Needs to be a valid URL')
});

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Download');
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  
  const form = useForm({
    initialValues: { url: '' },
    validate: zodResolver(schema),
  });

  const reset = () => {
    setIsLoading(false);
    setButtonText('Download');
    form.setValues({ url: '' });
  }

  const handleDownload = async (values: { url: string; }) => {
    setIsLoading(true);
    setButtonText('Requesting file...');

    const url : URL = new URL(`${location.protocol}//${location.host}/api/dl`);
    url.searchParams.set('url', values.url);

    const res = await fetch(url);

    setCurrentTicket(res.headers.get('X-Download-Ticket'));

    if (!res.ok || !res.body) {
      reset();
      return showNotification({
        message: 'Failed getting file - Check if the URL is supported.',
        color: 'red',
      });
    }

    const blob = await res.blob();

    setCurrentTicket(null);

    const contentDisposition = res.headers.get('Content-Disposition');

    let filename: string | null = null;
    if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      var matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    saveAs(blob, filename || 'download.mp3');

    showNotification({
      message: 'File has been downloaded. HFGL!',
      color: 'green',
    });

    reset();
  }

  return (
    <>
      <Head>
        <title>MusicDL</title>
        <meta name="description" content="MusicDL helps you to download music from sources like YouTube or Soundcloud" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="MusicDL - Music DownLoader" />
        <meta property="og:description" content="MusicDL helps you to download music from sources like YouTube or Soundcloud" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://musicdl.de" />
        <meta property="og:image" content="https://musicdl.de/og_image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container h="100vh">
          <Flex direction="column" h="100%" justify="center" align="center" gap="xs">
            <Group>
              <Image src={Logo} alt="Logo" width={60} height={60} />
              <Flex direction="column">
                <Title order={1}>MusicDL</Title>
                <Text color="dimmed">Link to MP3 converter</Text>
              </Flex>
            </Group>
            <Paper shadow="xs" p="md" withBorder>
              <form onSubmit={form.onSubmit(handleDownload)}>
                <Flex direction="column" w="20rem" gap="md">
                  <TextInput
                    label="URL"
                    withAsterisk
                    disabled={isLoading}
                    placeholder="https://youtube.com/watch?v=OdEN9kQPtbc"
                    {...form.getInputProps('url')}
                  />
                  <Flex gap="xs" justify="center">
                    <Tooltip label="YouTube">
                      <ThemeIcon color="red">
                        <IconBrandYoutube size={18} />
                      </ThemeIcon>
                    </Tooltip>
                    <Tooltip label="Soundcloud">
                      <ThemeIcon color="orange">
                        <IconBrandSoundcloud size={18} />
                      </ThemeIcon>
                    </Tooltip>
                    <Tooltip label="Instagram">
                      <ThemeIcon color="orange" variant='gradient' gradient={{ from: '#F77737', to: '#833AB4' }}>
                        <IconBrandInstagram size={18} />
                      </ThemeIcon>
                    </Tooltip>
                    <Tooltip label="Facebook">
                      <ThemeIcon color="blue">
                        <IconBrandFacebook size={18} />
                      </ThemeIcon>
                    </Tooltip>
                    <Tooltip label="And many more!">
                      <ActionIcon onClick={() => openSupportedSitesModal()}>
                        <IconDots />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                  <Button
                    variant='outline'
                    type='submit'
                    color='gray'
                    loading={isLoading}
                  >
                    {buttonText}
                  </Button>
                  {
                    currentTicket !== null &&
                    <DownloadProgress ticket={currentTicket} />
                  }
                </Flex>
              </form>
            </Paper>
            <Text color="dimmed" fz="xs">Made with ❤️ for Allegra</Text>
            <UnstyledButton onClick={() => openDisclaimerModal()}>
              <Group>
                <Text fz="xs">Disclaimer & Usage Policy</Text>
              </Group>
            </UnstyledButton>
            <ResourceUsage />
          </Flex>
        </Container>
      </main>
    </>
  )
}
