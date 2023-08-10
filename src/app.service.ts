import { Injectable } from '@nestjs/common';
import { AxiosService } from './axios.service';

@Injectable()
export class AppService {
  constructor(private readonly axiosService: AxiosService) {}
  _sessionId: string;
  sessionsMap: Map<string, any> = new Map();
  getHello(): string {
    return 'Hello World!';
  }

  async handleNewSession(
    sessionId: string,
    transcription?: any[],
  ): Promise<void> {
    this.sessionsMap.set(sessionId, sessionId);
    this.setSession(sessionId)
    const strTrans = this.handleTranscription(transcription);
    this.axiosService.initMessageInSlack(sessionId, strTrans);
  }

  async handleMessageFromStudio(
    sessionId: string,
    message: string,
  ): Promise<void> {
    console.log(`${sessionId} Customer - ${message}`);
    await this.axiosService.sendMessageToSlack(message, 'User');
  }

  async handleSlackMessage(message: string): Promise<void> {
    console.log(`send message back to studio - session id: ${this.getSession}`);
    try {
      this.axiosService.sendMessageToStudio(this.getSession, message);
    } catch (err) {
      await this.axiosService.sendMessageToSlack('Failed to send message');
    }
    await this.axiosService.sendMessageToSlack(message, 'Live Agent');
  }

  async handleSlackComplete(): Promise<void> {
    console.log(`complete session ${this.getSession}. Notifying studio`);
    await this.axiosService.disconnectFromStudio(this.getSession);
    await this.axiosService.sendMessageToSlack(
      'Conversation marked as solved',
      null,
      true,
    );
  }

  private handleTranscription(transcription?: any[]): string {
    if (transcription == null) {
      return null;
    }
    let strTrans = '```';
    for (const message of transcription) {
      for (const key in message) {
        strTrans = `${strTrans}\n${key}: ${message[key]}`;
      }
    }
    strTrans += '```';
    console.log(strTrans);

    return strTrans;
  }

  async removeSession(sessionId) {
    console.log('current live session', sessionId)
    await this.axiosService.disconnectFromStudio(sessionId);
  }

  setSession(sessionId) {
    console.log('set session', sessionId)
    this._sessionId = sessionId;
  }

  get getSession() {
    console.log('get session', this._sessionId)
    return this._sessionId;
  }

  async setVgaiKey(key) {
    this.axiosService.setVgaiKey(key)
  }
}
