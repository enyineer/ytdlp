import Head from 'next/head'
import { Button, Container, Flex, Paper, Text, TextInput, Title } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { z } from 'zod'
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import Link from 'next/link';

const schema = z.object({
  url: z.string().url('Needs to be a valid URL')
});

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Download');
  
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

    if (!res.ok || !res.body) {
      reset();
      return showNotification({
        message: 'Failed getting file - Check if the URL is supported.',
        color: 'red',
      });
    }

    const blob = await res.blob();
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
        <meta name="description" content="Music downloader without any dogshit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container h="100vh">
          <Flex direction="column" h="100%" justify="center" align="center" gap="xs">
            <Title>MusicDL</Title>
            <Paper shadow="xs" p="md" withBorder>
              <form onSubmit={form.onSubmit(handleDownload)}>
                <Flex direction="column" w="20rem" gap="md">
                  <TextInput
                    label="URL"
                    withAsterisk
                    disabled={isLoading}
                    {...form.getInputProps('url')}
                  />
                  <Button
                    variant='outline'
                    type='submit'
                    color='gray'
                    loading={isLoading}
                  >
                    {buttonText}
                  </Button>
                </Flex>
              </form>
            </Paper>
            <Text color="dimmed" fz="xs">Easy music downloader - no dogshit included</Text>
            <Text color="dimmed" fz="xs">Made by <Link href="https://enking.dev" target="_blank">Niggo</Link></Text>
          </Flex>
        </Container>
      </main>
    </>
  )
}
