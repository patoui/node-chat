const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const basicAuth = require('express-basic-auth');

app.use(basicAuth({
    users: { 'secret': 'secret' },
    challenge: true
}));

server.listen(process.env.PORT || 3000);

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Websocket
io.on('connection', (socket) => {
  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', data);
  });

  socket.on('add user', (username) => {
    let data = {
        message: `${username} has entered the room.`,
        timestamp: new Date(),
        username: username,
        type: 'info',
    };

    socket.emit('login', data);
    socket.broadcast.emit('user joined', data);
  });
});
