// src/ratings/rating.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Store } from '../stores/store.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  value: number; // 1-5

  @ManyToOne(() => User, (user) => user.ratings)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Store, (store) => store.ratings)
  store: Store;

  @Column()
  storeId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}