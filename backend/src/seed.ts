import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  await usersService.create({
    name: 'System Administrator Account',
    email: 'admin@platform.com',
    password: 'Admin@1234',
    address: 'Admin HQ, Platform City, Country',
    role: 'admin',
  });

  console.log('✅ Admin created: admin@platform.com / Admin@1234');
  await app.close();
}

seed();