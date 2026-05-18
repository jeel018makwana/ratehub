// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(dto: CreateUserDto) {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);

    // Fix: cast role to enum, default to USER
    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      address: dto.address,
      password: hashed,
      role: (dto.role as UserRole) ?? UserRole.USER,
    });

    const saved = await this.repo.save(user);  // save returns single User, not array
    const { password, ...result } = saved;     // this now works correctly
    return result;
  }

  async findAll(filters?: { name?: string; email?: string; address?: string; role?: string }) {
    const where: any = {};
    if (filters?.name) where.name = Like(`%${filters.name}%`);
    if (filters?.email) where.email = Like(`%${filters.email}%`);
    if (filters?.address) where.address = Like(`%${filters.address}%`);
    if (filters?.role) where.role = filters.role;
    return this.repo.find({
      where,
      select: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id }, relations: ['ratings'] });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async updatePassword(id: number, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, { password: hashed });
    return { message: 'Password updated successfully' };
  }

  async count() {
    return this.repo.count();
  }
}