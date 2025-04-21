'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from '@/context/SocketProvider'
import ReactPlayer from 'react-player';
import PeerService from '@/service/peer';

function Streams() {
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const socket = useSocket();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerServiceRef = useRef<PeerService>(null);

  useEffect(() => {
    peerServiceRef.current = new PeerService();
  }, []);

  const hanldleUserJoined = useCallback(({ email, id }: { email: string, id: string }) => {
    console.log('User joined with email:', email);
    setRemoteSocketId(id);
  }, []);

  const handleIncomingCall = useCallback(async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {
    console.log('Incoming Call from', from);

    setRemoteSocketId(from);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    setLocalStream(stream);

    const answer = await peerServiceRef.current?.getAnswer(offer);

    socket?.emit('call:accepted', {
      to: from,
      answer
    })
  }, [socket]);

  const sendStream = useCallback(() => {
    if (peerServiceRef.current && localStream) {
      for (const track of localStream?.getTracks()) {
        peerServiceRef.current.peer?.addTrack(track, localStream);
      }
    }
  }, [localStream])

  const handleCallAccepted = useCallback(({ answer }: { answer: RTCSessionDescriptionInit }) => {
    peerServiceRef.current?.setLocalDescription(answer);
    console.log('call accpeted');

    sendStream();
  }, [sendStream]);

  const handleNegotiationNedded = useCallback(async () => {
    const offer = await peerServiceRef.current?.getOffer();
    socket?.emit('peer:nego:needed', {
      to: remoteSocketId,
      offer
    });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peerServiceRef.current?.peer?.addEventListener('track', async (e) => {
      const remoteStream = e.streams;
      setRemoteStream(remoteStream[0]);
    })
  }, []);

  useEffect(() => {
    peerServiceRef.current?.peer?.addEventListener('negotiationneeded', handleNegotiationNedded);

    return () => {
      peerServiceRef.current?.peer?.removeEventListener('negotiationneeded', handleNegotiationNedded);
    }
  }, [handleNegotiationNedded]);

  const handleIncomingNegotiation = useCallback(async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {
    const answer = await peerServiceRef.current?.getAnswer(offer);
    socket?.emit('peer:nego:done', {
      to: from,
      answer
    })
  }, [socket]);

  const handleNegotiationFinal = useCallback(async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
    await peerServiceRef.current?.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    socket?.on('user:joined', hanldleUserJoined);
    socket?.on('call:incoming', handleIncomingCall);
    socket?.on('call:accepted', handleCallAccepted);
    socket?.on('peer:nego:needed', handleIncomingNegotiation);
    socket?.on('peer:nego:final', handleNegotiationFinal);

    return () => {
      socket?.off('user:joined', hanldleUserJoined);
      socket?.off('call:incoming', handleIncomingCall);
      socket?.off('call:accepted', handleCallAccepted);
      socket?.off('peer:nego:needed', handleIncomingNegotiation);
      socket?.off('peer:nego:final', handleNegotiationFinal);
    }
  }, [socket, hanldleUserJoined, handleIncomingCall, handleCallAccepted, handleIncomingNegotiation, handleNegotiationFinal]);

  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const offer = await peerServiceRef.current?.getOffer();

    socket?.emit('user:call', {
      to: remoteSocketId,
      offer
    })

    setLocalStream(stream);
  }, [remoteSocketId, socket]);

  return (
    <div>
      <h2 className='font-lg text-lg text-center'>{remoteSocketId ? 'Someone joined the room. Click the call button to initiate the call' : 'Wait for someone to join the room'}</h2>

      {
        localStream && (
          <button onClick={handleCallUser} className='px-2 py-1 m-4 min-w-16 rounded-lg bg-white text-black border border-white/20 cursor-pointer'>
            Send Stream
          </button>
        )
      }

      {
        remoteSocketId && (
          <button onClick={handleCallUser} className='px-2 py-1 m-4 min-w-16 rounded-lg bg-white text-black border border-white/20 cursor-pointer'>
            Join
          </button>
        )
      }

      <div className='flex gap-24'>
        {
          localStream && (
            <div>
              <h1 className='text-2xl font-sans font-bold tracking-tight'>Local Stream</h1>
              <ReactPlayer playing muted={false} height={300} width={500} url={localStream} />
            </div>
          )
        }

        {
          remoteStream && (
            <div>
              <h1 className='text-2xl font-sans font-bold tracking-tight'>Remote Stream</h1>
              <ReactPlayer playing muted={false} height={300} width={500} url={remoteStream} />
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Streams
