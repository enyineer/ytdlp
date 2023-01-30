import { Flex, Progress, Text } from '@mantine/core';
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

  return (
    <Flex gap="xs" align="center">
      <Text fz="xs" color="dimmed">CPU: {currentUsage?.cpu}% MEM: {currentUsage?.mem}%</Text>
    </Flex>
  );
}