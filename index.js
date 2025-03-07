const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        socket.username = username;
        io.emit('message', `${username} joined the chat`, 'System', new Date());
    });

    socket.on('chatMessage', (msg) => {
        io.emit('message', msg, socket.username, new Date());
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            io.emit('message', `${socket.username} left the chat`, 'System', new Date());
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
