import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateFollowUpDto {
  @IsString() @MaxLength(160) title!: string;
  @IsDateString() dueAt!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() result?: string;
  @IsOptional() @IsString() leadId?: string;
}

export class UpdateFollowUpDto {
  @IsOptional() @IsString() @MaxLength(160) title?: string;
  @IsOptional() @IsDateString() dueAt?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() result?: string;
  @IsOptional() @IsString() leadId?: string | null;
}

export class CompleteFollowUpDto {
  @IsOptional() @IsString() result?: string;
  @IsOptional() @IsString() @MaxLength(160) nextTitle?: string;
  @IsOptional() @IsDateString() nextDueAt?: string;
}
