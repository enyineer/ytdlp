import { ButtonProps } from '@mantine/core';
import { IconArrowBarToDown } from '@tabler/icons-react';
import { ReactNode, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import useSocket from '../hooks/useSocket';
import { DownloadProgress as DownloadProgressType } from '../pages/api/dl';
import { ProgressButton } from './ProgressButton';

type DownloadProgressProps = {
  ticket: string | null;
  loading?: boolean;
  onProgress?: (percentager: number) => void;
  onClick?: () => void;
  type?: ButtonProps['type'];
  leftIcon?: ReactNode;
}

export default function DownloadButton(props: DownloadProgressProps) {
  const { socket } = useSocket();
  const [currentProgress, setCurrentProgress] = useState<DownloadProgressType | null>(null);
  const ticket = props.ticket;

  const joinRoom = (socket: Socket, ticket: string) => {
    socket.emit('joinRoom', `ticket-${ticket}`);
  }

  const leaveRoom = (socket: Socket, ticket: string) => {
    socket.emit('leaveRoom', `ticket-${ticket}`);
  }

  // Join rooms whenever ticket changes and socket isnt null
  useEffect(() => {
    if (socket !== null && ticket !== null) {
      joinRoom(socket, ticket);
    }
    return () => {
      if (socket !== null && ticket !== null) {
        leaveRoom(socket, ticket);
      }
    }
  }, [socket, ticket]);

  // Listen to progress if current ticket changes
  useEffect(() => {
    if (socket !== null && ticket !== null) {
      const progressEventName = `progress-${ticket}`;

      socket.on(progressEventName, (progress: DownloadProgressType) => {
        setCurrentProgress(progress);
      });

      return () => {
        socket.off(progressEventName);
      }
    }
  }, [ticket, socket]);

  // Reset progress if ticket is null
  useEffect(() => {
    if (ticket === null) {
      setCurrentProgress(null);
    }
  }, [ticket]);

  const percentage = Math.ceil(
    ((currentProgress?.ffmpeg.value || 0) + (currentProgress?.ytdlp.value || 0)) / 2
  );

  if (props.onProgress) {
    props.onProgress(percentage);
  }

  return (
    <ProgressButton
      color="gray"
      finishedColor="dark"
      progress={percentage}
      loading={props.loading}
      texts={{
        default: 'Download',
        inProgress: 'Downloading...'
      }}
      leftIcon={props.leftIcon}
      onClick={props.onClick}
      variant='outline'
      type={props.type}
    />
  );
}