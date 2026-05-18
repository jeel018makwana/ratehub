import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { RatingsService } from '../ratings/ratings.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private usersService: UsersService,
    private storesService: StoresService,
    private ratingsService: RatingsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getStats() {
    const [users, stores, ratings] = await Promise.all([
      this.usersService.count(),
      this.storesService.count(),
      this.ratingsService.count(),
    ]);
    return { totalUsers: users, totalStores: stores, totalRatings: ratings };
  }
}