import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ){}

    async login(cedula: string, password: string) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { cedula }, // ✅ usamos campo único
        });

        if (!usuario) {
            throw new UnauthorizedException('Cédula no encontrada');
        }

        const valid = await bcrypt.compare(password, usuario.password);
        if (!valid) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        return {
            access_token: this.jwtService.sign({
                sub: usuario.id,
                userName: usuario.userName,
                cedula: usuario.cedula,
            }),
        };
    }
      
}