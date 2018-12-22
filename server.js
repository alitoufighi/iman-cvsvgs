var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var colors = require('colors');
// let uid = 0;

function Client() {
  this.id;
  this.pos;
  this.rot;
  this.bAnim;
  this.fAnim;
}
function getClient(data) {
  let cl = new Client();
  cl.id = data.id;
  cl.pos = data.pos;
  cl.rot = data.rot;
  cl.bAnim = data.bAnim;
  cl.fAnim = data.fAnim;
  cl.lastCommand = data.lastCommand;
  cl.m_Move = [];
  cl.arguments = [];
  return cl;
}

let clients = [];
let defaultClient = [getClient({
  id: -1,
  pos: [200, 4, -370],
  rot: [0, 90, 0],
  bAnim: [0, 0],
  fAnim: [0, 0, 0, 0, 0, 0],
  lastCommand: "",
  m_Move: [],
  arguments: []
}), getClient({
  id: -1,
  pos: [210, 5, -370],
  rot: [0, -90, 0],
  bAnim: [0, 0],
  fAnim: [0, 0, 0, 0, 0, 0],
  lastCommand: "",
  m_Move: [],
  arguments: []
})];

app.set('port', process.env.PORT || 8888);
server.listen(app.get('port'), function () {
  console.log("WELCOME TO SERVER!".yellow);
  setTimeout(() => {
    console.log("SERVER IS ONLINE!".yellow);
  }, 1000);
});

io.on('connection', function (socket) {
  console.log('new player joined!');
  // new player requests to join
  socket.on("request join", function (data) {
    console.log(`player joined with ${socket.id}`.blue);
    const cl = getClient(
      defaultClient[Math.floor(Math.random() * defaultClient.length)]
    );
    cl.id = socket.id;
    socket.emit("receive join info", cl);
    clients.forEach(c => {
      socket.emit("new player joined", c);
    });
    socket.broadcast.emit("new player joined", cl);
    clients.push(cl);
  });

  socket.on("update info", function (data) {
    try {
      let c = clients.find(el => el.id == data.id);
      Object.assign(c, {
        pos: data.pos,
        rot: data.rot,
        fAnim: data.fAnim,
        bAnim: data.bAnim,
        lastCommand: data.lastCommand,
        m_Move: data.m_Move,
        arguments: data.arguments
      });
      socket.broadcast.emit("update player info", c);
    } catch (err) {
      console.error("error occurred!", err);
      console.log("data on error: ", data);
    }
  });

  socket.on('disconnect', function () {
    console.log(`USER ${socket.id} DISCONNECTED!`.red);
    socket.broadcast.emit("player disconnect", clients.find(el => el.id === socket.id));
    clients = clients.filter(el => el.id !== socket.id);
  });
});