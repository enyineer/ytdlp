import { Flex, Progress, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import useSocket from '../hooks/useSocket';
import { DownloadProgress as DownloadProgressType } from '../pages/api/dl';

type DownloadProgressProps = {
  ticket: string;
}

export default function DownloadProgress(props: DownloadProgressProps) {
  const { socket } = useSocket();
  const [currentProgress, setCurrentProgress] = useState<DownloadProgressType | null>(null);

  // Join rooms whenever ticket changes and socket isnt null
  useEffect(() => {
    if (socket !== null && props.ticket !== null) {
      socket.emit('joinRoom', `ticket-${props.ticket}`);
    }
    // TODO Return cleanup function for leaving?
  }, [socket, props.ticket]);

  // Listen to progress event if current ticket changes
  useEffect(() => {
    if (socket !== null && props.ticket !== null) {
      const progressEventName = `progress-${props.ticket}`;
      socket.on(progressEventName, (progress: DownloadProgressType) => {
        setCurrentProgress(progress);
      });
      return () => {
        socket.off(progressEventName);
      }
    }
  }, [props.ticket, socket]);

  return (
    <Flex direction="column" gap="xs" align="center">
      <Progress value={currentProgress?.ytdlp.value || 0} color="blue" />
      <Text fz="xs">{currentProgress?.ytdlp.text} {currentProgress?.ytdlp.value}%</Text>
      <Progress value={currentProgress?.ffmpeg.value || 0} color="cyan" />
      <Text fz="xs">{currentProgress?.ffmpeg.text} {currentProgress?.ffmpeg.value}%</Text>
    </Flex>
  );
}