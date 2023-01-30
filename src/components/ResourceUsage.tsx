import { Center, Flex, Grid, Group, Progress, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconCpu, IconDatabase } from '@tabler/icons-react';
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
        });
      });
      return () => {
        socket.off(updateName);
      }
    }
  }, [socket]);

  if (currentUsage === null) {
    return <></>;
  }

  return (
    <Grid w="10rem" mt={1}>
      <Grid.Col span={6}>
        <Center>
          <Flex direction="column" align="center" gap={4}>
            <Tooltip label={`CPU ${currentUsage.cpu}%`}>
              <ThemeIcon color="gray">
                <IconCpu />
              </ThemeIcon>
            </Tooltip>
            <Progress value={currentUsage.cpu} w="100%"/>
          </Flex>
        </Center>
      </Grid.Col>
      <Grid.Col span={6}>
        <Center>
          <Flex direction="column" align="center" gap={4}>
            <Tooltip label={`MEM ${currentUsage.mem}%`}>
              <ThemeIcon color="gray">
                <IconDatabase />
              </ThemeIcon>
            </Tooltip>
            <Progress value={currentUsage.mem} w="100%"/>
          </Flex>
        </Center>
      </Grid.Col>
    </Grid>
  );
}