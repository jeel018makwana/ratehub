// src/ratings/ratings.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  upsert(@Request() req, @Body() dto: CreateRatingDto) {
    return this.ratingsService.upsert(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('store/:storeId')
  byStore(@Param('storeId') storeId: string) {
    return this.ratingsService.findByStore(+storeId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('my')
  myRatings(@Request() req) {
    return this.ratingsService.findByUser(req.user.id);
  }
}