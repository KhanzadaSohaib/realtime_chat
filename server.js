const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utlis/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utlis/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 4000;
const DATABASE_URL = process.env.DATABASE_URL;
const API_KEY = process.env.API_KEY;

console.log(`Server running on port ${PORT}`);
console.log(`Database URL: ${DATABASE_URL}`);
console.log(`API Key: ${API_KEY}`);

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatAPP Bot";

//run when clint connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to chatApp"));

    // Broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  //Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      //send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
