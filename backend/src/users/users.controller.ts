// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Public signup
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // Admin: create any user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // Admin: list all users with filters
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  // Admin: user details
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // Logged-in user: update own password
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.usersService.updatePassword(req.user.id, dto.newPassword);
  }
}