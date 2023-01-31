import Head from "next/head";
import {
  ActionIcon,
  Container,
  Flex,
  Group,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { saveAs } from "file-saver";
import {
  IconArrowBarToDown,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandSoundcloud,
  IconBrandYoutube,
  IconDots,
} from "@tabler/icons-react";
import DownloadButton from "../components/DownloadButton";
import { open as openDisclaimerModal } from "../components/DisclaimerModal";
import { open as openSupportedSitesModal } from "../components/SupportedSitesModal";
import ResourceUsage from "../components/ResourceUsage";
import Logo from "../../graphics/Logo.svg";
import Image from "next/image";

const schema = z.object({
  url: z.string().url("Needs to be a valid URL"),
});

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);

  const form = useForm({
    initialValues: { url: "" },
    validate: zodResolver(schema),
  });

  const reset = () => {
    setIsLoading(false);
    form.setValues({ url: "" });
  };

  const handleDownload = async (values: { url: string }) => {
    setIsLoading(true);

    const url: URL = new URL(`${location.protocol}//${location.host}/api/dl`);
    url.searchParams.set("url", values.url);

    const res = await fetch(url);

    setCurrentTicket(res.headers.get("X-Download-Ticket"));

    if (!res.ok) {
      reset();
      const json = await res.json();
      return showNotification({
        message: json.message,
        color: "red",
      });
    }

    const blob = await res.blob();

    setCurrentTicket(null);

    const contentDisposition = res.headers.get("Content-Disposition");

    let filename: string | null = null;
    if (contentDisposition && contentDisposition.indexOf("attachment") !== -1) {
      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      var matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    }

    saveAs(blob, filename || "download.mp3");

    showNotification({
      message: "File has been downloaded. HFGL!",
      color: "green",
    });

    reset();
  };

  return (
    <>
      <Head>
        <title>MusicDL</title>
        <meta
          name="description"
          content="MusicDL helps you to download music from sources like YouTube or Soundcloud"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="MusicDL - Music DownLoader" />
        <meta
          property="og:description"
          content="MusicDL helps you to download music from sources like YouTube or Soundcloud"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://musicdl.de" />
        <meta property="og:image" content="https://musicdl.de/og_image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container h="100vh" p="xl">
          <Flex
            direction="column"
            h="100%"
            justify="space-between"
            align="center"
            gap="xs"
          >
            <Flex direction="column" align="center" gap="md">
              <Flex justify="center" gap="sm" align="center">
                <Image src={Logo} alt="Logo" width={60} height={60} />
                <Flex direction="column" align="center" justify="center">
                  <Title order={1}>MusicDL</Title>
                  <Text>Link to MP3</Text>
                </Flex>
              </Flex>
            </Flex>
            <form onSubmit={form.onSubmit(handleDownload)}>
              <Flex direction="column" w="20rem" gap="md">
                <TextInput
                  label="Link"
                  withAsterisk
                  disabled={isLoading}
                  placeholder="https://youtube.com/watch?v=OdEN9kQPtbc"
                  {...form.getInputProps("url")}
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
                    <ThemeIcon
                      color="orange"
                      variant="gradient"
                      gradient={{ from: "#F77737", to: "#833AB4" }}
                    >
                      <IconBrandInstagram size={18} />
                    </ThemeIcon>
                  </Tooltip>
                  <Tooltip label="Facebook">
                    <ThemeIcon color="blue">
                      <IconBrandFacebook size={18} />
                    </ThemeIcon>
                  </Tooltip>
                  <Tooltip label="And many more!">
                    <ActionIcon
                      onClick={() => openSupportedSitesModal()}
                      title="Supported Websites"
                    >
                      <IconDots />
                    </ActionIcon>
                  </Tooltip>
                </Flex>
                <DownloadButton
                  ticket={currentTicket}
                  loading={isLoading}
                  type='submit'
                  leftIcon={<IconArrowBarToDown size={16} />}
                />
              </Flex>
            </form>
            <Flex direction="column" align="center">
              <Text color="dimmed" fz="xs">
                Made with ❤️ for Allegra
              </Text>
              <UnstyledButton onClick={() => openDisclaimerModal()}>
                <Group>
                  <Text fz="xs">Disclaimer & Usage Policy</Text>
                </Group>
              </UnstyledButton>
              <ResourceUsage />
            </Flex>
          </Flex>
        </Container>
      </main>
    </>
  );
}
