import { Socket } from "socket.io";


export interface Users {
id: any
name: string
room: string
}

const users: Users[] = []

export const getSocketGameRoom =(socket: Socket): string | undefined => {
   const socketRooms = Array.from(socket.rooms.values()).filter(
     (r) => r !== socket.id
   );
   const gameRoom = socketRooms && socketRooms[0];

   return gameRoom;
 }

export const removeUser = (id: Users['id']) => {
   const removeIndex = users.findIndex(user => user.id === id)

   if(removeIndex!==-1)
       return users.splice(removeIndex, 1)[0]
}

export const getUser = (id: Users['id']) => {
   return users.find(user => user.id === id)
}

export const getUsersInRoom = (room: Users['room']) => {
   return users.filter(user => user.room === room)
}
