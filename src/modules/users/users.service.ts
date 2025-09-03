import { Injectable, BadRequestException } from '@nestjs/common';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  findAll(): User[] {
    return this.users;
  }

  create(user: User): User {
    const exists = this.users.find(u => u.username === user.username);
    if (exists) {
      throw new BadRequestException('Username already exists');
    }

    user.userId = this.nextId++;
    this.users.push(user);
    return user;
  }
}
