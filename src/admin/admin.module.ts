import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { Application } from '../entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  controllers: [AdminController],
})
export class AdminModule {}
