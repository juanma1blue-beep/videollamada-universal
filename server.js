const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('Usuario conectado al servidor de señalización');
});

// Usamos el puerto que nos da Railway o el 8080 por defecto
const PORT = process.env.PORT || 8080;

// IMPORTANTE: Añadimos '0.0.0.0' para que Railway pueda acceder desde internet
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});