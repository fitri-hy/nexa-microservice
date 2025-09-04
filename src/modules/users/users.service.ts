// Practice Simulation //
// =================== //

import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from './users.entity';
import { CreateUserDto } from './users.dto';

// Prometheus Metrics
import { userCreatedCounter } from '../../telemetry/telemetry.module';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  findAll(): User[] {
    return this.users;
  }

  create(dto: CreateUserDto): User {
    if (!dto.username || !dto.password) {
      throw new BadRequestException('Username and password are required');
    }

    const exists = this.users.find(u => u.username === dto.username);
    if (exists) {
      throw new BadRequestException(`Username "${dto.username}" already exists`);
    }

    const newUser: User = {
      userId: this.nextId++,
      username: dto.username,
      password: dto.password,
    };

    this.users.push(newUser);

    // --- Catat metric user baru ---
    userCreatedCounter.inc();

    return newUser;
  }
}