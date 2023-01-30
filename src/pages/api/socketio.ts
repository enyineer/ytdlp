import { NextApiRequest, NextApiResponse } from 'next'
import { Socket } from 'net';
import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";
import si from "systeminformation";

export type ResourceInfo = {
  cpu: number;
  mem: number;
}

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

let ioServer: SocketIOServer | null = null;

export default function handler(_: NextApiRequest, res: NextApiResponseServerIO) {
  const ioServer = getSocket(res);

  if (!res.socket.server.io) {
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = ioServer;
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export function getSocket(res: NextApiResponseServerIO) {
  if (!ioServer) {
    console.log("New Socket.io server...");
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any;
    ioServer = new SocketIOServer(httpServer, {
      path: "/api/socketio",
    });

    ioServer.on('connection', (socket) => {
      socket.on('joinRoom', (room: string) => {
        socket.join(room);
      });
    });

    setInterval(async () => {
      if (ioServer) {
        const currentLoad = await si.currentLoad();
        const cpuLoadAverage = currentLoad.cpus.reduce((a, b) => a + Math.floor(b.load), 0) / currentLoad.cpus.length;
        const mem = await si.mem();
        const freeMemPercentage = (mem.free / mem.total) * 100;

        const data: ResourceInfo = {
          cpu: cpuLoadAverage,
          mem: freeMemPercentage,
        }

        ioServer.emit('resources', data);
      }
    }, 5000);
  }

  return ioServer;
}
