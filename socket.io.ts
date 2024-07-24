import { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import * as http from "http";

export interface SocketIOInstance extends SocketIOServer {
    // Add custom events or methods if needed for your chat functionality
  }
  interface Player {
    id: string;
    username: string;
    userId: string;
    gameMode?: string; // Optional property
    timeout?: NodeJS.Timeout; // Optional property to store timeout ID
  }
  interface Room {
    owner: string;
    userId: string;
    gameMode: string;
    roomName: string;
  }
  
  export const createSocketIOServer = (httpServer: http.Server, options? : Object): SocketIOServer => {
    const io = new SocketIOServer(httpServer, options);
    const rooms: { [key: string]: Room } = {}; //stores jambo rooms
    const players: { [key: string]: Player } = {}; //stores players for jambo standard
    const userId: string[] = [];
    const opponents: { [roomId: string]: {id: string, opponent: string, stake: number |null} } = {};
    const playAgainUsers: { [roomId: string]: string[] } = {};
    io.on("connection", (socket: Socket) => {
        socket.on("create_room", ({id, roomId, opponent1, stake}) => {
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id
                );
            const userExists = id !== undefined && userId.includes(id);
            const roomExists = io.sockets.adapter.rooms.has(roomId);
            if (userExists) {
            socket.emit("error", {
                error: "Already in room", //room already exists
            });
            return;
            }
            if (roomExists || socketRooms.length > 0) {
            socket.emit("error", {
                error: "Internal server error", //room already exists
            });
            return;
            }
            console.log("New User joining room: ", roomId);
            userId.push(id);
            if (!opponents[roomId]) {
                opponents[roomId] = { id: "", opponent: "", stake: null }; // Initialize opponents[roomId] if it doesn"t exist
            }
            opponents[roomId].id = id;
            opponents[roomId].opponent = opponent1;
            stake && (opponents[roomId].stake = stake);

            
            socket.join(roomId);
            socket.emit("room_created", {player:"player1"});
            socket.on("disconnect", () => {
                socket.to(roomId).emit("room_left");
                io.sockets.adapter.rooms.delete(roomId);
                delete opponents[roomId];
                userId.splice(userId.indexOf(id), 1);
                console.log("room deleted", roomId);
                console.log("new opponents", opponents);
                console.log("new userIDs", userId);
                })
        })

        socket.on("join_room", ({id, roomId, opponent2}) => {
            const connectedSockets = io.sockets.adapter.rooms.get(roomId);
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id);
            const userExists = id !== undefined && userId.includes(id);
            const roomExists = io.sockets.adapter.rooms.has(roomId);
            if (userExists) {
                socket.emit("room_join_error", {
                error: "Already in room",
                });
                return;
            }
            if (roomExists) {
                if (
                socketRooms.length > 0 ||
                (connectedSockets && connectedSockets.size === 2)
                ) {
                    socket.emit("room_join_error", {
                    error: "Room is full please choose another room to play!",
                    });
                }
                else {
                    if(opponents[roomId].stake != null) {
                        socket.emit("staked_room", {stake: opponents[roomId].stake});
                        socket.on("confirm_join", () => {
                            socket.join(roomId);
                            userId.push(id);
                            const opponent1 = opponents[roomId].opponent;
                            const opponent1Id = opponents[roomId].id;
                            playAgainUsers[roomId] = [];
                            console.log(opponent1)
                            socket.emit("room_joined", {player:"player2", opponent1});
                    
                            if (io.sockets.adapter.rooms.get(roomId)?.size === 2){
                                io.to(roomId).emit("room_full");
                                socket.to(roomId).emit("opponent", {opponent2});
                                socket.to(roomId).emit("register_match", ({userIdOne: opponent1Id, userIdTwo: id, stake: opponents[roomId].stake}));
                            }
                            console.log("New User joining room: ", roomId);
                        })
                        socket.on("reject_join", () => {
                            socket.emit("room_join_error", {
                                error: "Failed to join room",
                            });
                            socket.leave(roomId);
                        })
                    } else {
                        socket.join(roomId);
                        userId.push(id);
                        const opponent1 = opponents[roomId].opponent;
                        playAgainUsers[roomId] = [];
                        console.log(opponent1)
                        socket.emit("room_joined", {player:"player2", opponent1});
                        
                        if (io.sockets.adapter.rooms.get(roomId)?.size === 2){
                            io.to(roomId).emit("room_full");
                            socket.to(roomId).emit("opponent", {opponent2});
                            console.log(opponent2)
                        }
                        console.log("New User joining room: ", roomId);
                    }
                }
            }
            else {
            socket.emit("room_join_error", {error: "Room does not exist"})
            }
            socket.on("disconnect", () => {
                socket.to(roomId).emit("room_left");
                io.sockets.adapter.rooms.delete(roomId);
                delete opponents[roomId];
                userId.splice(userId.indexOf(id), 1);
                console.log("room deleted", roomId);
                console.log("new opponents", opponents);
                console.log("user disconnected", socket.id);
                console.log("userIds", userId);
                })
        })

        socket.on("init_game_state", gameState => {
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id
            );
            io.to(socketRooms[0]).emit("init_game_state", gameState)
        })

        socket.on("update_game_state", gameState => {
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id
            );
                socket.to(socketRooms[0]).emit("update_game_state", gameState)
        })

        socket.on("play_again", (gameState) => {
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id
            );
            playAgainUsers[socketRooms[0]].push(socket.id);
            console.log(playAgainUsers);
            console.log(playAgainUsers[socketRooms[0]].length);
            if (playAgainUsers[socketRooms[0]].length % 2 === 0) {
                io.to(socketRooms[0]).emit("init_game_state", gameState)
            }
        })

        socket.on("send_message", (data) => {
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id
            );
            socket.to(socketRooms[0]).emit("message", (data))
            console.log(data);
        })
        socket.on("leave_room", ({roomName}) => {
            socket.to(roomName).emit("room_left");
            io.sockets.adapter.rooms.delete(roomName);
            delete opponents[roomName];
            console.log("room deleted", roomName);
            console.log("new opponents", opponents);
        })
        socket.on("insufficient_balance", ({roomName}) => {
            socket.to(roomName).emit("insufficient_balance");
            // io.sockets.adapter.rooms.delete(roomName);
            // delete opponents[roomName];
            // console.log("room deleted", roomName);
            // console.log("new opponents", opponents);
        })
        
        socket.on("jambo_standard", (data) => {
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id);
            const userExists = userId.includes(data.id);
            if (socketRooms.length > 0 || userExists) {
                socket.emit("error", { message: "Already in a room" });
                return;
            }
            const id = data.id;
            const gameMode = data.mode;
            const username = data.username; // Access username from event data
            console.log(gameMode, username);

            players[socket.id] = { id: socket.id, username, userId: id, gameMode }; // Store player data with username, gameMode refers to stake
            userId.push(id);
            const timeoutId = setTimeout(() => {
                // No matching player found within 30 seconds, emit error
                console.log("No matching player found within 30 seconds");
                socket.emit("error", { message: "No players available. Please try again later." });
                delete players[socket.id]; // Remove player from the object after timeout
                userId.splice(userId.indexOf(id), 1);
              }, 30000); // Set timeout for 30 seconds
          
              players[socket.id].timeout = timeoutId;
              console.log(players);

            const potentialMatch = findMatchingPlayer(players, socket.id, gameMode);
            if (potentialMatch) {
                // Players found, start the game
                const player1 = socket.id;
                const player2 = potentialMatch;
                const player1Username = players[player1].username;
                const player2Username = players[player2].username;
                const userIdOne = players[player1].userId;
                const userIdTwo = players[player2].userId;

                players[player1].timeout && clearTimeout(players[player1].timeout as NodeJS.Timeout);
                players[player2].timeout && clearTimeout(players[player2].timeout as NodeJS.Timeout);
                delete players[player1]; // Remove game mode from players object after match
                delete players[player2];
            
                const roomName = Math.random().toString(36).substring(2, 7);
                socket.join(roomName);
                const player2Socket = player2 && io.sockets.sockets.get(player2);
                if (player2Socket) {
                player2Socket.join(roomName);
                }              
            // Send game start message with usernames to both players
                io.to(roomName).emit("game_start", {
                    player1Id: player1,
                    player2Id: player2,
                    roomName,
                    player1Username,
                    player2Username,
                    // userIdOne,
                    // userIdTwo
                });
                socket.to(roomName).emit("register_match", {userIdOne, userIdTwo, stake: gameMode});
        
              // Handle game logic within the game room (e.g., sending moves, updating game state)
              // ...
            }
            socket.on("disconnect", () => {
                userId.splice(userId.indexOf(id), 1);
                console.log("userIds", userId);
              });
          });
          socket.on("disconnect", () => {
            const playerId = socket.id;
            const player = players[playerId];
            if (player && player.timeout) {
                clearTimeout(player.timeout);
                delete players[playerId];
            }
          });
          socket.on("create_jambo_room", ({ id, username, gameMode}) => {
            const userExists = userId.includes(id);
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id);
            if (socketRooms.length > 0 || userExists) {
                socket.emit("jambo_room_error", { message: "Already in a room" });
                return;
            }  
              const roomName = Math.random().toString(36).substring(2, 7); 
              if (!rooms[roomName]) {
                rooms[roomName] = { owner: username, userId: id, gameMode, roomName };
                userId.push(id);
                socket.join(roomName);
                console.log(`${username} created room: ${roomName}`);
                socket.emit("jambo_room_created", { roomName });
            } else {
              // Handle scenario where room name already exists (optional: suggest alternative name)
              socket.emit("jambo_room_error", {message: "Internal server error! Try Again."});
            }
            socket.on("disconnect", () => {
                delete rooms[roomName];
                userId.splice(userId.indexOf(id), 1);
                io.sockets.adapter.rooms.delete(roomName);
                console.log("userIds", userId);
              });
          });
        
          socket.on("get_available_rooms", () => {
            const availableRooms = Object.keys(rooms).map((id) => ({ owner: rooms[id].owner, gameMode: rooms[id].gameMode, roomName: rooms[id].roomName }));
            socket.emit("room_list", availableRooms);
          });
        
          socket.on("join_jambo_room", ({ id, username, roomName}) => {
            const userExists = userId.includes(id);
            const socketRooms = Array.from(socket.rooms.values()).filter(
                (r) => r !== socket.id);
            if (socketRooms.length > 0 || userExists) {
                socket.emit("error", { message: "Already in a room" });
                return;
            }
            if (!rooms[roomName]) {
              socket.emit("error", {message: "Room does not exist"});
              return;
            }
            userId.push(id);
            socket.join(roomName);
            // socket.to(roomName).emit("game_start", { id: socket.id, opponentUsername: username, gameMode: rooms[roomName].gameMode, roomName });
            // socket.emit("game_start", { id: socket.id , opponentUsername: rooms[roomName].owner, gameMode: rooms[roomName].gameMode, roomName });
            io.to(roomName).emit("game_start", {
                player1Id: socket.id,
                roomName,
                gameMode: rooms[roomName].gameMode,
                player1Username: username,
                player2Username: rooms[roomName].owner,
                // userIdOne: id,
                // userIdTwo: rooms[roomName].userId
                });
            socket.to(roomName).emit("register_match", {userIdOne: id, userIdTwo: rooms[roomName].userId, stake: rooms[roomName].gameMode});
            socket.on("match_id", ({id}) => {
                console.log("mactch id", id);
                socket.to(roomName).emit("match_id", {id});
            });
            delete rooms[roomName]; // Remove room after game starts (optional)
            socket.on("disconnect", () => {
                userId.splice(userId.indexOf(id), 1);
                console.log("userIds", userId);
              });
          });

    });
        function findMatchingPlayer(players: { [key: string]: Player }, socketId: string, gameMode: string): string | null {
            for (const playerId in players) {
              if (players[playerId].gameMode === gameMode && playerId !== socketId) {
                return playerId; // Found a matching player
              }
            }
            return null; // No matching player found yet
          }
        return io

  }