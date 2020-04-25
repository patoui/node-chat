const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const basicAuth = require('express-basic-auth');
const fs = require('fs');

server.listen(process.env.PORT || 3000);

app.use(basicAuth({
    users: { 'secret': 'secret' },
    challenge: true
}));

// Routing
app.use(express.static(path.join(__dirname, 'public')));

const user_config = __dirname + '/users.json';
let rawdata = fs.readFileSync(user_config);
let users = rawdata.length ? JSON.parse(rawdata) : {};

function updateUsers(username, data) {
    if (users[username] === undefined) {
        users[username] = data;

        fs.writeFile(
            user_config,
            JSON.stringify(users),
            (err) => { if (err) throw err; }
        );
    }
}

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
    updateUsers(username, {timestamp: data.timestamp});
  });
});
