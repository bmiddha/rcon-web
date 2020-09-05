import React, { PureComponent, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import io from 'socket.io-client';
import './Console.css';

interface ConsoleProps {}

interface ConsoleState {
  output: string[];
  auth: boolean;
  connected: boolean;
  command: string;
  history: string[];
  historyIndex: number;
}

export class Console extends PureComponent<ConsoleProps, ConsoleState> {
  private _webSocket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  constructor(props: ConsoleProps, state: ConsoleState) {
    super(props, state);

    this.state = {
      output: [
        "LinuxKnight's Super Mega Awesome RCON Web Session",
        '!connect host port password',
        '!disconnect',
      ],
      auth: false,
      connected: false,
      command: '',
      history: [],
      historyIndex: -1,
    };
  }

  connect = (host: string, port: number, password: string) => {
    this._webSocket = io('localhost:8080');
    this._webSocket.emit('connectRcon', { host, port, password });
    this._webSocket
      .on('connect', () => this.setState({ connected: true }))
      .on('auth', () =>
        this.setState({ auth: true, output: [...this.state.output, 'Authentication Successful'] }),
      )
      .on('response', (res: string) => this.setState({ output: [...this.state.output, res] }))
      .on('disconnect', () => this.setState({ connected: false, auth: false }))
      .on('error', (err: Error) => {
        this.setState({ output: [...this.state.output, 'ERROR'] });
        throw err;
      });
  };

  disconnect = () => {
    this._webSocket.disconnect();
  };

  handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ command: event.target.value });
  };
  internalCommands = ['!connect', '!disconnect'];
  internalCommandHandler = () => {
    const { command } = this.state;
    const prefix = command.split(' ')[0];
    if (prefix === '!connect' && command.split(' ').length === 4) {
      const host = command.split(' ')[1];
      const port = command.split(' ')[2];
      const password = command.split(' ')[3];
      this.connect(host, parseInt(port), password);
    }
    if (prefix === '!disconnect') {
      this.disconnect();
    }
  };

  externalCommandHandler = () => {
    this._webSocket.emit('command', this.state.command);
  };

  handleSubmit = (event: FormEvent) => {
    if (this.internalCommands.indexOf(this.state.command.split(' ')[0]) !== -1) {
      this.internalCommandHandler();
    } else {
      this.externalCommandHandler();
    }
    this.setState({ history: [this.state.command, ...this.state.history] });
    this.setState({ command: '' });
    event.preventDefault();
  };

  keyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 38 || event.keyCode === 40) {
      let { historyIndex } = this.state;
      const historyLength = this.state.history.length;
      if (event.keyCode === 38 && historyIndex < historyLength - 1) {
        historyIndex++;
      }
      if (event.keyCode === 40 && historyIndex > -1) {
        historyIndex--;
      }
      const command = historyIndex < 0 ? '' : this.state.history[historyIndex];
      this.setState({ historyIndex, command });
      event.preventDefault();
    }
  };

  componentDidUpdate() {
    const shellBody = document.getElementsByClassName('shell-body')[0];
    shellBody.scrollTop = shellBody.scrollHeight;
  }

  render() {
    return (
      <>
        <div className="shell-wrap">
          <p className="shell-top-bar">
            Connected: {this.state.connected.toString()} Auth: {this.state.auth.toString()}
          </p>
          <ul className="shell-body">
            {this.state.output.map((str, key) => (
              <li key={key}>{str}</li>
            ))}
          </ul>
          <form onSubmit={this.handleSubmit} className="shell-form">
            <input
              type="text"
              className="shell-command-input"
              onChange={this.handleChange}
              value={this.state.command}
              onKeyDown={this.keyDownHandler}
            />
            <input type="submit" value="Excecute" />
          </form>
        </div>
      </>
    );
  }
}

export default Console;
