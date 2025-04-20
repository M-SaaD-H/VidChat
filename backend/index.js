import { Server } from 'socket.io'

const io = new Server(4000, {
  cors: true
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on('connection', (socket) => {
  console.log('Socket Connected:', socket.id);

  socket.on('room:join', ({ email, roomCode }) => {
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    io.to(roomCode).emit('user:joined', {
      email,
      id: socket.id
    });

    socket.join(roomCode);

    io.to(socket.id).emit('room:join', {
      email,
      roomCode
    })
  })

  socket.on('user:call', ({ to, offer }) => {
    io.to(to).emit('call:incoming', {
      from: socket.id,
      offer
    })
  })

  socket.on('call:accepted', ({ to, answer }) => {
    io.to(to).emit('call:accepted', {
      from: socket.id,
      answer
    })
  })

  socket.on('negotiationneeded', ({ to, offer }) => {
    io.to(to).emit('peer:nego:needed', {
      from: socket.id,
      offer
    })
  })

  socket.on('peer:nego:done', ({ to, answer }) => {
    io.to(to).emit('peer:nego:final', {
      from: socket.id,
      answer
    })
  })
})