import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  Render,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  loginPage(@Req() req: Request, @Res() res: Response) {
    if ((req.session as any)?.userId) {
      return res.redirect('/admin');
    }
    return res.render('admin/login', { error: null });
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return res.render('admin/login', {
        error: 'Email ou mot de passe incorrect.',
      });
    }
    (req.session as any).userId = user.id;
    (req.session as any).userName = user.fullName;
    return res.redirect('/admin');
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  }
}
