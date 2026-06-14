const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Servir los archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado: ' + socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log('Usuario ' + socket.id + ' se unió a la sala: ' + roomId);
        
        // Avisar a otros en la sala
        socket.to(roomId).emit('user-connected', socket.id);
    });

    // --- PUENTE DE SEÑALIZACIÓN (Para conectar las cámaras) ---
    
    socket.on('offer', (payload) => {
        io.to(payload.target).emit('offer', {
            offer: payload.offer,
            sender: socket.id
        });
    });

    socket.on('answer', (payload) => {
        io.to(payload.target).emit('answer', {
            answer: payload.answer,
            sender: socket.id
        });
    });

    socket.on('ice-candidate', (payload) => {
        io.to(payload.target).emit('ice-candidate', {
            candidate: payload.candidate,
            sender: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
