import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from './users.entity';
import { CreateUserDto } from './users.dto';

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
    return newUser;
  }
}
