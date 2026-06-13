const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Esto sirve los archivos de tu carpeta 'public'
app.use(express.static('public'));

// Aquí gestionamos la conexión de los usuarios
io.on('connection', (socket) => {
    console.log('Dispositivo conectado: ' + socket.id);

    // Cuando un usuario se une a una sala
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log('Usuario unido a la sala: ' + roomId);
        
        // Avisamos a los demás usuarios en esa misma sala
        socket.to(roomId).emit('user-connected', socket.id);
    });

    // Cuando alguien se desconecta
    socket.on('disconnect', () => {
        console.log('Dispositivo desconectado');
    });
});

// El servidor escucha en el puerto 3000 y en todas las interfaces de red (0.0.0.0)
server.listen(3000, '0.0.0.0', () => {
    console.log("Servidor universal activo en puerto 3000");
});