import Rcon from 'ts-rcon';
import socketio from 'socket.io';
import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('*', (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname + '../../client/build/index.html'));
});

interface RconConfig {
  host: string;
  password: string;
  port: number;
  options?: {
    tcp?: boolean;
    challenge?: boolean;
    id?: number;
  };
}

io.on('connection', client => {
  let rconClient: Rcon;
  client.on('connectRcon', (config: RconConfig) => {
    const { host, port, password, options } = config;
    rconClient = new Rcon(host, port, password, options);
    rconClient
      // .on('connect', () => {})
      .on('auth', () => {
        io.emit('auth');
      })
      .on('response', (res: string) => {
        io.emit('response', res);
      })
      .on('end', () => {
        io.emit('disconnect');
      })
      .on('error', (err: Error) => {
        io.emit('error', err);
      });
    rconClient.connect();
  });
  client.on('disconnect', () => {
    if (rconClient) rconClient.disconnect();
  });
  client.on('command', (command: string) => {
    rconClient.send(command);
  });
});

server.listen(port);
