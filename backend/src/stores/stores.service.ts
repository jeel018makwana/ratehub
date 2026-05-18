// src/stores/stores.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(@InjectRepository(Store) private repo: Repository<Store>) {}

  async create(dto: CreateStoreDto) {
    const store = this.repo.create(dto);
    return this.repo.save(store);
  }

  async findAll(filters?: { name?: string; address?: string }) {
    const where: any = {};
    if (filters?.name) where.name = Like(`%${filters.name}%`);
    if (filters?.address) where.address = Like(`%${filters.address}%`);
    const stores = await this.repo.find({ where, relations: ['ratings'] });
    return stores.map((store) => ({
      ...store,
      averageRating:
        store.ratings.length > 0
          ? +(store.ratings.reduce((s, r) => s + r.value, 0) / store.ratings.length).toFixed(2)
          : null,
    }));
  }

  async findOne(id: number) {
    const store = await this.repo.findOne({ where: { id }, relations: ['ratings', 'ratings.user'] });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async count() {
    return this.repo.count();
  }
}