import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('studio/start')
  @HttpCode(204)
  studioStart(@Body() body: any): void {
    console.log(body);
    console.log(body?.history?.transcription);
    this.appService.handleNewSession(
      body.sessionId,
      body.history?.transcription,
    );
  }

  @Post('studio/message')
  @HttpCode(204)
  studioMessage(@Body() body: any): void {
    console.log(body);
    this.appService.handleMessageFromStudio(body.sessionId, body.text);
  }

  @Post('slack/message')
  @HttpCode(204)
  slackMessage(@Body() body: any): void {
    console.log(body);
    this.appService.handleSlackMessage(body.text);
  }

  @Post('slack/end')
  @HttpCode(204)
  slackEnd(@Body() body: any): void {
    console.log(body);
    this.appService.handleSlackComplete();
  }

  @Post('remove')
  @HttpCode(204)
  async removeSession(@Body() body: any) {
    console.log(body);
    await this.appService.removeSession(body.sessionId);
  }


  @Post('setKey')
  @HttpCode(204)
  async setVgaiKey(@Body() body: any) {
    console.log(body);
    await this.appService.setVgaiKey(body.key);
  }

  @Post('slack/event')
  @HttpCode(200)
  slackEvent(@Body() body: any): any {
    console.log(body);
    if (body.challenge != null) {
      return { challenge: body.challenge };
    }
    return null;
    // this.appService.handleSlackComplete();
  }
}
