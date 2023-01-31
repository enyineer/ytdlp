import { Center, Flex, Grid, Group, Progress, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconCpu, IconDatabase, IconDownload } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import useSocket from '../hooks/useSocket';
import { ResourceInfo } from '../pages/api/socketio';

export default function ResourceUsage() {
  const { socket } = useSocket();
  const [currentUsage, setCurrentUsage] = useState<ResourceInfo | null>(null);

  // Listen to progress event if current ticket changes
  useEffect(() => {
    if (socket !== null) {
      const updateName = `resources`;
      socket.on(updateName, (update: ResourceInfo) => {
        setCurrentUsage({
          cpu: Math.floor(update.cpu),
          mem: Math.floor(update.mem),
          downloads: update.downloads,
        });
      });
      return () => {
        socket.off(updateName);
      }
    }
  }, [socket]);

  return (
    <Grid w="10rem" mt={1}>
      <Grid.Col span={4}>
        <Center>
          <Flex direction="column" align="center" gap={6}>
            <Tooltip label={`CPU ${currentUsage?.cpu || 0}%`}>
              <ThemeIcon color="gray">
                <IconCpu size={18} />
              </ThemeIcon>
            </Tooltip>
            <Progress value={currentUsage?.cpu || 0} w="100%" mt={2} mb={8} aria-label="CPU Usage" />
          </Flex>
        </Center>
      </Grid.Col>
      <Grid.Col span={4}>
        <Center>
          <Flex direction="column" align="center" gap={6}>
            <Tooltip label={`MEM ${currentUsage?.mem || 0}%`}>
              <ThemeIcon color="gray">
                <IconDatabase size={18} />
              </ThemeIcon>
            </Tooltip>
            <Progress value={currentUsage?.mem || 0} w="100%" mt={2} mb={8} aria-label="Memory Usage"/>
          </Flex>
        </Center>
      </Grid.Col>
      <Grid.Col span={4}>
        <Center>
          <Flex direction="column" align="center">
            <Tooltip label={`${currentUsage?.downloads || 0} Downloads`}>
              <ThemeIcon color="gray">
                <IconDownload size={18} />
              </ThemeIcon>
            </Tooltip>
            <Text fz="xs" color="dimmed" mt={2}>{currentUsage?.downloads || ''}</Text>
          </Flex>
        </Center>
      </Grid.Col>
    </Grid>
  );
}