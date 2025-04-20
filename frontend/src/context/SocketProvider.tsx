'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useMemo(() => io(process.env.NEXT_PUBLIC_SERVER_URL as string), []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}