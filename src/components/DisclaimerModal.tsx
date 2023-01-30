import { Flex, Text } from '@mantine/core';
import { openModal } from '@mantine/modals';

export const open = () => openModal({
  title: 'Disclaimer',
  children: (<DisclaimerModal />),
});

export default function DisclaimerModal() {
  return (
    <Flex direction="column" gap="md">
      <Text>Only for private use backup copies! Using this service commercially or in any other non intended way is forbidden.</Text>
      <Text>All rights belong to the respective copyright owners.</Text>
      <Text>You may not use this service with any kind of automation or it might need to shut down in the future. Please respect fair use.</Text>
    </Flex>
  )
}