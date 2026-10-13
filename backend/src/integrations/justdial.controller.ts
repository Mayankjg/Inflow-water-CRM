import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadSource, LeadStatus } from '@prisma/client';

@Controller('integrations/justdial')
export class JustdialController {
  constructor(private prisma: PrismaService) {}

  @Post('webhook')
  @HttpCode(200)
  async receive(@Body() body: any, @Headers('x-webhook-secret') secret?: string) {
    // Placeholder verification only. Replace with Justdial's documented auth/signature scheme.
    const configuredSecret = process.env.JUSTDIAL_WEBHOOK_SECRET;
    if (configuredSecret && secret !== configuredSecret) throw new UnauthorizedException('Invalid webhook secret');

    const name = String(body?.name ?? body?.customer_name ?? '').trim();
    const phone = String(body?.phone ?? body?.mobile ?? body?.customer_mobile ?? '').trim();
    const externalLeadId = body?.lead_id ?? body?.leadId ?? body?.id ?? null;
    const requirement = body?.requirement ?? body?.message ?? body?.query ?? null;
    const email = body?.email ?? body?.customer_email ?? null;

    if (!name || (!phone && !email)) {
      await this.prisma.integrationEvent.create({ data: { provider: 'JUSTDIAL', externalId: externalLeadId ? String(externalLeadId) : null, outcome: 'REJECTED', message: 'Missing customer name and contact information' } });
      return { received: false, message: 'Required customer details are missing' };
    }

    if (externalLeadId) {
      const existing = await this.prisma.lead.findUnique({ where: { externalLeadId: String(externalLeadId) } });
      if (existing) return { received: true, duplicate: true, leadId: existing.id };
    }

    const lead = await this.prisma.lead.create({
      data: {
        name, phone: phone || null, email: email ? String(email) : null,
        requirement: requirement ? String(requirement) : null,
        source: LeadSource.JUSTDIAL, status: LeadStatus.NEW,
        externalLeadId: externalLeadId ? String(externalLeadId) : null,
      },
    });
    await this.prisma.integrationEvent.create({ data: { provider: 'JUSTDIAL', externalId: externalLeadId ? String(externalLeadId) : null, outcome: 'CREATED', message: `Lead ${lead.id} created` } });
    return { received: true, duplicate: false, leadId: lead.id };
  }
}
