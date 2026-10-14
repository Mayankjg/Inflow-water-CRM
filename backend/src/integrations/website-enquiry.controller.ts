import { BadRequestException, Body, Controller, Headers, HttpCode, Post, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { LeadSource, LeadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

class WebsiteEnquiryDto {
  @IsString() @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(160) company?: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsOptional() @IsString() @MaxLength(120) city?: string;
  @IsOptional() @IsString() @MaxLength(120) state?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @IsOptional() @IsString() @MaxLength(5000) requirement?: string;
}

@Controller('integrations/website')
export class WebsiteEnquiryController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('enquiry')
  @HttpCode(201)
  async receive(@Body() body: WebsiteEnquiryDto, @Headers('x-enquiry-secret') provided?: string) {
    const configured = process.env.WEBSITE_ENQUIRY_SECRET;
    if (!configured || configured.length < 32) {
      throw new ServiceUnavailableException('Website enquiry endpoint is not configured');
    }
    const actualBuffer = Buffer.from(provided || '', 'utf8');
    const expectedBuffer = Buffer.from(configured, 'utf8');
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Invalid enquiry credentials');
    }
    const name = body.name.trim();
    const phone = body.phone?.trim();
    const email = body.email?.trim();
    if (!name || (!phone && !email)) {
      throw new BadRequestException('Customer name and phone or email are required');
    }
    const lead = await this.prisma.lead.create({ data: {
      name, company: body.company?.trim() || null, address: body.address?.trim() || null,
      city: body.city?.trim() || null, state: body.state?.trim() || null,
      phone: phone || null, email: email || null, requirement: body.requirement?.trim() || null,
      source: LeadSource.WEBSITE, status: LeadStatus.NEW,
    } });
    return { received: true, leadId: lead.id };
  }
}
