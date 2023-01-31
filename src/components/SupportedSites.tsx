import { ActionIcon, Flex, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandSoundcloud,
  IconBrandYoutube,
  IconDots,
} from "@tabler/icons-react";
import { open as openSupportedSitesModal } from "../components/SupportedSitesModal";

export default function SupportedSites() {
  return (
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
  );
}
