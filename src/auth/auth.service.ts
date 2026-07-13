import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userRepo.count();
    if (count === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await this.userRepo.save(
        this.userRepo.create({
          email: 'admin@selys-africa.com',
          password: hash,
          fullName: 'Administrateur SELYS',
        }),
      );
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }
}
