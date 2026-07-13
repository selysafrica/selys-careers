import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplyController } from './apply.controller';
import { ApplyService } from './apply.service';
import { StorageModule } from '../storage/storage.module';
import { Application } from '../entities/application.entity';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([Application])],
  controllers: [ApplyController],
  providers: [ApplyService],
})
export class ApplyModule {}
