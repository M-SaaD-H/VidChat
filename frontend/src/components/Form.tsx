'use client'

import { useSocket } from '@/context/SocketProvider';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'

function Form() {
  const [email, setEmail] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const router = useRouter();

  const socket = useSocket();

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    socket?.emit('room:join', {
      email,
      roomCode
    });
  }, [email, roomCode, socket]);

  const handleJoinRoom = useCallback(({ roomCode }: { roomCode: string }) => {
    router.replace(`/room/${roomCode}`);
  }, [router]);

  useEffect(() => {
    socket?.on('room:join', handleJoinRoom);

    return () => {
      socket?.off('room:join', handleJoinRoom);
    }
  }, [socket, handleJoinRoom]);

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
      <div className='flex gap-4 justify-center items-center'>
        <label htmlFor='email'>Email</label>
        <input id='email' type='email' onChange={(e) => setEmail(e.target.value)} className='border border-white/20 px-2 py-1 rounded-lg' />
      </div>
      <div className='flex gap-4 justify-center items-center'>
        <label htmlFor='roomCode'>Room Code</label>
        <input id='roomCode' type='text' onChange={(e) => setRoomCode(e.target.value)} className='border border-white/20 px-2 py-1 rounded-lg' />
      </div>

      <button type='submit' className='px-2 py-1 m-4 min-w-16 rounded-lg bg-white text-black border border-white/20 cursor-pointer'>
        Join
      </button>
    </form>
  )
}

export default Form
