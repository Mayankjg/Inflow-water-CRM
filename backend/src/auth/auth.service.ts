import { BadRequestException, ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import * as nodemailer from 'nodemailer';
const scrypt = promisify(scryptCallback);

export class RegisterDto {
  @IsString() @MaxLength(40) username!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(8) @MaxLength(128) password!: string;
}
export class LoginDto { @IsString() username!: string; @IsString() password!: string; }
export class EmailDto { @IsEmail() email!: string; }
export class ResetDto { @IsString() token!: string; @IsString() @MinLength(8) @MaxLength(128) password!: string; }

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async status() { return { registrationOpen: !(await this.prisma.authState.findUnique({ where: { id: 'global' } }))?.registrationClosedAt }; }
  private async hashPassword(password: string) {
    const salt = randomBytes(16);
    const key = await scrypt(password, salt, 64) as Buffer;
    return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
  }
  private async verifyPassword(password: string, stored: string) {
    const [kind, salt, key] = stored.split('$');
    if (kind !== 'scrypt' || !salt || !key) return false;
    const expected = Buffer.from(key, 'base64url');
    const actual = await scrypt(password, Buffer.from(salt, 'base64url'), expected.length) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
  private session(user: { id: string; username: string }) {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) throw new ServiceUnavailableException('Authentication is not configured');
    const encoded = Buffer.from(JSON.stringify({ sub: user.id, username: user.username, role: 'MAIN_ADMIN', exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
    return { accessToken: `${encoded}.${createHmac('sha256', secret).update(encoded).digest('base64url')}`, user: { username: user.username, role: 'MAIN_ADMIN' } };
  }
  async register(dto: RegisterDto) {
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) throw new ServiceUnavailableException('Authentication is not configured');
    const username = dto.username.trim(); const email = dto.email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) throw new BadRequestException('Username must be 3–40 letters, numbers, dots, dashes, or underscores');
    try {
      const user = await this.prisma.$transaction(async tx => {
        if (await tx.authState.findUnique({ where: { id: 'global' } })) throw new ConflictException('Initial registration is closed');
        await tx.authState.create({ data: { id: 'global', registrationClosedAt: new Date() } });
        return tx.adminUser.create({ data: { id: 'main-admin', username, email, passwordHash: await this.hashPassword(dto.password) } });
      });
      return this.session(user);
    } catch (e) {
      if (e instanceof ConflictException) throw e;
      if ((e as any)?.code === 'P2002') throw new ConflictException('Initial registration is closed');
      throw e;
    }
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.adminUser.findUnique({ where: { username: dto.username.trim() } });
    if (!user || !(await this.verifyPassword(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid username or password');
    return this.session(user);
  }
  async forgotPassword(emailValue: string) {
    const email = emailValue.trim().toLowerCase();
    const user = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!user) return { message: 'If that email belongs to the admin account, a reset link has been sent.' };
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;
    const frontend = process.env.FRONTEND_URL;
    if (!smtpHost || !smtpUser || !smtpPass || !from || !frontend) throw new ServiceUnavailableException('Password reset email is not configured');
    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await this.prisma.passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
    const link = `${frontend.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
    const transporter = nodemailer.createTransport({ host: smtpHost, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: smtpUser, pass: smtpPass } });
    try { await transporter.sendMail({ from, to: user.email, subject: 'Reset your Inflow Water CRM password', text: `Use this link within 30 minutes to set a new password:\n\n${link}\n\nIf you did not request this, ignore this email.` }); }
    catch { await this.prisma.passwordResetToken.delete({ where: { tokenHash } }); throw new ServiceUnavailableException('Could not send the password reset email'); }
    return { message: 'If that email belongs to the admin account, a reset link has been sent.' };
  }
  async resetPassword(dto: ResetDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const reset = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) throw new BadRequestException('This reset link is invalid or expired');
    await this.prisma.$transaction(async tx => {
      const claimed = await tx.passwordResetToken.updateMany({ where: { id: reset.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
      if (!claimed.count) throw new BadRequestException('This reset link is invalid or expired');
      await tx.adminUser.update({ where: { id: reset.userId }, data: { passwordHash: await this.hashPassword(dto.password) } });
      await tx.passwordResetToken.deleteMany({ where: { userId: reset.userId, id: { not: reset.id } } });
    });
    return { message: 'Password updated. You can now sign in.' };
  }
}
