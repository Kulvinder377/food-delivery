import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express(); app.use(cors()); app.use(express.json());
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'PlatePath realtime API' }));
app.post('/api/orders', (req, res) => { const order = { id: `PP-${Date.now().toString().slice(-5)}`, ...req.body, status: 'Confirmed' }; io.emit('order:created', order); res.status(201).json(order); });
io.on('connection', socket => { socket.on('driver:location', point => socket.broadcast.emit('driver:location', point)); });
server.listen(process.env.PORT || 4000, () => console.log('API listening on :4000'));
