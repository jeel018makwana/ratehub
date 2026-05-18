import { IsInt, Min, Max, IsNumber } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  value: number;

  @IsNumber()
  storeId: number;
}