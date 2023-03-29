import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';

// ROUTES
import auth from './routes/auth.js';
import { orders, io } from './routes/orders.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
io.attach(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(auth);
app.use(orders);

server.listen(process.env.APP_PORT || 5000, () => {
  console.log('Server on');
});
