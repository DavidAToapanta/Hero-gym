import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateUsuarioDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { cedula: dto.cedula },
    });

    if (existente) {
      throw new BadRequestException('Ya existe un usuario con esa cédula');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        userName: dto.userName,
        password: hashedPassword,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        cedula: dto.cedula,
        fechaNacimiento: dto.fechaNacimiento,
      },
    });

    const { password, ...result } = usuario;
    return result;
  }
}
