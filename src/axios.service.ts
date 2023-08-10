import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import http from 'http';

@Injectable()
export class AxiosService {
  xVgaiKey: string
  constructor(private readonly httpService: HttpService) {
    this.httpService.axiosRef.defaults.headers.post['Content-Type'] =
      'application/json';
  }
  private basedStudioUrl = 'https://studio-api-eu.ai.vonage.com/live-agent';
  private basedSlackUrl =
    'https://hooks.slack.com/services/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';

  getHello(): string {
    return 'Hello World!';
  }

  async sendMessageToSlack(
    message: string,
    sender?: string,
    systemNote = false,
  ): Promise<void> {
    console.log(`sending ${sender}'s message to slack: ${message}`);
    const prefix = sender ? `${sender}:` : '';
    const text = systemNote
      ? `system: \`${message}\``
      : `${prefix}\n\`\`\`${message}\`\`\``;
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.basedSlackUrl}`,
        { text },
        {},
      );

      console.log(response.data);
    } catch (err) {
      console.log('error:', err);
      throw err;
    }
  }

  async initMessageInSlack(
    sessionId: string,
    transcription?: string,
  ): Promise<void> {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.basedSlackUrl}`,
        {
          text: `You have new session to take care of: \`${sessionId}\`\nTranscription:${transcription}`,
        },
        {},
      );

      console.log(response.data);
    } catch (err) {
      console.log('error');
      throw err;
    }
  }

  async sendMessageToStudio(sessionId: string, message: string): Promise<void> {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.basedStudioUrl}/outbound/${sessionId}`,
        { message_type: 'text', text: message },
        this.createStudioRequestConf(),
      );

      console.log(response.data);
    } catch (err) {
      console.log('error');
      throw err;
    }
  }

  async disconnectFromStudio(sessionId: string): Promise<void> {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.basedStudioUrl}/disconnect/${sessionId}`,
        {},
        this.createStudioRequestConf(),
      );

      console.log(response.data);
    } catch (err) {
      console.log('error');
      throw err;
    }
  }

  private createStudioRequestConf(): AxiosRequestConfig {
    const httpHeaders: http.OutgoingHttpHeaders = {
      'X-Vgai-Key': this.xVgaiKey,
    };

    const headers = Object.assign(httpHeaders) as unknown as Record<
      string,
      string
    >;
    const reqConf: AxiosRequestConfig = { headers };

    return reqConf;
  }

  setVgaiKey(xVgaiKey: string) {
    this.xVgaiKey = xVgaiKey;
  }
}
