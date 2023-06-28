import express from "express";
import http from "http";
import { Server } from "socket.io";
import createGame from "./public/game.js";

const app = express();
const server = http.createServer(app);
const sockets = new Server(server);

app.use(express.static("public"));

const game = createGame();

game.subscribe((command) => {
  console.log(`> Emitting ${command.type}`);
  sockets.emit(command.type, command);
});

sockets.on("connection", (socket) => {
  const playerId = socket.id;
  console.log(`> Player connected on Server with id: ${playerId}`);

  game.addPlayer({ playerId });

  socket.emit("setup", game.state);

  socket.on("disconnect", () => {
    game.removePlayer({ playerId });
    console.log("Player ID disconnected:>> ", playerId);
  });

  socket.on("move-player", (command) => {
    command.playerId = playerId;
    command.type = "move-player";
    game.movePlayer(command);
  });
});

server.listen(3030, () => {
  console.log("Server listening on port: 3030");
});
