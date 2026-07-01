import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('postuler')
  index() {
    return {};
  }

  @Get('response')
  @Render('merci')
  merci() {
    return {};
  }
}
