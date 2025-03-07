const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

let users = {};
let rooms = { general: [] };

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', ({ username, room }) => {
        socket.username = username;
        socket.room = room || 'general';
        socket.join(socket.room);
        users[socket.id] = username;

        io.to(socket.room).emit('message', { user: 'System', text: `${username} joined ${socket.room}!` });
        io.to(socket.room).emit('updateUsers', Object.values(users));
    });

    socket.on('chatMessage', (msg) => {
        io.to(socket.room).emit('message', { user: socket.username, text: msg });
    });

    socket.on('typing', (isTyping) => {
        socket.broadcast.to(socket.room).emit('typing', { user: socket.username, isTyping });
    });

    socket.on('reaction', (reaction) => {
        io.to(socket.room).emit('reaction', { user: socket.username, reaction });
    });

    socket.on('privateMessage', ({ recipient, msg }) => {
        const recipientSocket = Object.keys(users).find(id => users[id] === recipient);
        if (recipientSocket) {
            io.to(recipientSocket).emit('privateMessage', { user: socket.username, msg });
        }
    });

    socket.on('disconnect', () => {
        io.to(socket.room).emit('message', { user: 'System', text: `${socket.username} left the chat.` });
        delete users[socket.id];
        io.to(socket.room).emit('updateUsers', Object.values(users));
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
