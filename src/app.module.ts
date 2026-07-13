import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplyModule } from './apply/apply.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { Application } from './entities/application.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/selys-careers.db',
      entities: [Application, User],
      synchronize: true,
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST', 'smtp.gmail.com'),
          port: config.get<number>('MAIL_PORT', 587),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
          tls: { rejectUnauthorized: false },
        },
        defaults: {
          from: `"Candidature SELYS" <${config.get('MAIL_USER')}>`,
        },
      }),
    }),
    ApplyModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
