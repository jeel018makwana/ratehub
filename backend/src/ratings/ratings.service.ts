import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(@InjectRepository(Rating) private repo: Repository<Rating>) {}

  async upsert(userId: number, dto: CreateRatingDto) {
    let rating = await this.repo.findOne({ where: { userId, storeId: dto.storeId } });
    if (rating) {
      rating.value = dto.value;
      return this.repo.save(rating);
    }
    rating = this.repo.create({ userId, storeId: dto.storeId, value: dto.value });
    return this.repo.save(rating);
  }

  async findByStore(storeId: number) {
    return this.repo.find({ where: { storeId }, relations: ['user'] });
  }

  async findByUser(userId: number) {
    return this.repo.find({ where: { userId } });
  }

  async count() {
    return this.repo.count();
  }
}