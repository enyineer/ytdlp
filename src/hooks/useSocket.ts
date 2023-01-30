import { useEffect, useState } from 'react'
import { connect, Socket } from 'socket.io-client'

export type SocketState = 'disconnected' | 'connected';

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>('disconnected');

  useEffect(() => {
    const socket = connect('', {
      path: '/api/socketio',
    });

    socket.on('connect', () => {
      setSocket(socket);
      setState('connected');
    });

    if (socket) {
      return () => {
        setSocket(null);
        setState('disconnected');
        socket.disconnect();
      };
    }
  }, []);
  
  return { socket, state };
}