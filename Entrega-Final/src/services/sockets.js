import { Server } from "socket.io";
import messagesModel from "./dao/models/messages.model.js"

let messages = await messagesModel.find().lean();

const httpServer = app.listen(config.PORT, async () => {
    await mongoose.connect(config.MONGODB_URI);
    console.log(`Servidor activo en puerto ${config.PORT} enlazada a bbdd`);
  });
  
  const socketServer = new Server(httpServer);
  app.set("socketServer", socketServer);
  
  socketServer.on("connection", (socket) => {
    socket.emit("chatLog", messages);
    console.log(
      `Cliente conectado, id ${socket.id} desde ${socket.handshake.address}`
    );
    socket.on("newMessage", async (data) => {
    //   messages.push(data);

    const newMessage = await messagesModel.insertMany( data);
      console.log(
        `Mensaje recibido desde ${socket.id}: ${data.user}, ${data.message}`
      );
      socketServer.emit("messageArrived", data);
    });
  });
  