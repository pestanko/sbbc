/**
 * Created by wermington on 8/26/16.
 */


import winston from 'winston';
import {DefaultMessage, MessageFactory} from './messages';
import {exec, spawn} from 'child_process';

const spawnargs = require('spawn-args');


function dummy() {
}

export const States = {
  RUNNING: "runngin",
  READY: "ready",
  CLOSED: "closed"
};

export class Execution {
  constructor(command, config) {
    this.command = command;
    this.config = config;
    this.sync = false;
    this.state = States.READY;
  }

  onStdOut(callback) {
    callback = callback || dummy;
    if ((this.state != States.RUNNING)) {
      return;
    }

    this.process.stdout.on('data',callback);
  }

  onStdErr(callback) {
    if ((this.state != States.RUNNING)) {
      return;
    }

    this.process.stderr.on('data', callback);
  }

  onClose(callback) {

    callback = callback || dummy;
    this.state = States.CLOSED;
    this.process.on('close', function() {
      winston.info("[EXEC] Application has been closed!");
      callback(this.config);
    });

  }

  kill() {
    this.state = States.CLOSED;
    this.process.kill();
    winston.info("[EXEC] Application has been killed!");
  }

  exec() {
    this.state = States.RUNNING;
    const cmdNameString = this.command.substr(0, this.command.indexOf(' '));
    const cmdArgsString = this.command.substr(this.command.indexOf(' '), this.command.length);
    const args = spawnargs(cmdArgsString);
    winston.info("[EXEC]: %s ", cmdNameString, args);
    this.process = spawn(cmdNameString, args);
  }

}

export class Executor {
  static sync(command, config) {
    this.async(command, config);
  }

  static async(command, config) {
    config = config || {
        stdout: dummy,
        stderr: dummy
      };
    const execution = this.createExecution(command, config);

    try {
      execution.exec();

      execution.onStdOut(function(data) {
        data = data.slice(0, data.length - 1);
        winston.info(`[STDOUT]: ${data}`);
        config.stdout(data);
      });
      execution.onStdErr(function(data) {
        data = data.slice(0, data.length - 1);
        winston.info(`[STDERR]: ${data}`);
        config.stderr(data);
      });

      execution.onClose(function(data) {

      });

    } catch (e) {
      winston.error(e);
    }

    return execution;
  }

  static createExecution(command, config) {
    return new Execution(command, config);
  }
}