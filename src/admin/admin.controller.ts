import {
  Controller,
  Get,
  Param,
  Render,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard';
import { Application } from '../entities/application.entity';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
  ) {}

  @Get()
  @Render('admin/dashboard')
  async dashboard(@Req() req: Request) {
    const applications = await this.applicationRepo.find({
      order: { createdAt: 'DESC' },
    });
    return {
      userName: (req.session as any).userName,
      applications,
      total: applications.length,
    };
  }

  @Get('candidature/:id')
  @Render('admin/detail')
  async detail(@Param('id') id: number, @Req() req: Request) {
    const application = await this.applicationRepo.findOne({ where: { id } });
    if (!application) {
      return { application: null, userName: (req.session as any).userName };
    }
    return {
      application,
      userName: (req.session as any).userName,
    };
  }
}
