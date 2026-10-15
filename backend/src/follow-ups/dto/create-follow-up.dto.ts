import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateFollowUpDto {
  @IsString() @MaxLength(160) title!: string;
  @IsDateString() dueAt!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() leadId?: string;
}

export class UpdateFollowUpDto {
  @IsOptional() @IsString() @MaxLength(160) title?: string;
  @IsOptional() @IsDateString() dueAt?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() leadId?: string | null;
}
