import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: dto });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const take = Math.max(1, Math.min(limit, 50));
    const currentPage = Math.max(1, page);
    const skip = (currentPage - 1) * take;

    const trimmedSearch = search?.trim();
    const where: Prisma.ClienteWhereInput = trimmedSearch
      ? {
          OR: [
            {
              usuario: {
                nombres: { contains: trimmedSearch, mode: 'insensitive' },
              },
            },
            {
              usuario: {
                apellidos: { contains: trimmedSearch, mode: 'insensitive' },
              },
            },
            {
              usuario: {
                cedula: { contains: trimmedSearch, mode: 'insensitive' },
              },
            },
          ],
        }
      : {};

    // Ejecutamos count y fetch dentro de una transacción para mantener coherencia
    const [totalItems, clientes] = await this.prisma.$transaction([
      this.prisma.cliente.count({ where }),
      this.prisma.cliente.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'desc' },
        include: {
          usuario: true,
          planes: {
            orderBy: { fechaFin: 'desc' },
            take: 1,
            include: { plan: { select: { nombre: true } } },
          },
        },
      }),
    ]);
  
    return {
      data: clientes,
      meta: {
        totalItems,
        itemCount: clientes.length,
        perPage: take,
        totalPages: Math.ceil(totalItems / take),
        currentPage,
      },
    };
  }
  

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cliente.delete({ where: { id } });
  }

  async findRecientes(limit = 10) {
    // Trae clientes más recientes por id (si no hay createdAt)
    const clientes = await this.prisma.cliente.findMany({
      orderBy: { id: 'desc' },
      take: limit,
      include: {
        usuario: {
          select: { nombres: true, apellidos: true, userName: true },
        },
        // Último plan del cliente
        planes: {
          orderBy: { fechaFin: 'desc' },
          take: 1,
          include: { plan: { select: { nombre: true } } },
        },
      },
    });
    // Mapea a la forma que necesita el frontend
    return clientes.map((c: any) => {
      const cp = c.planes?.[0];
      const planNombre = cp?.plan?.nombre ?? '—';
      // Estado calculado por fechaFin: activo si hoy <= fechaFin
      let estadoPlan = '—';
      if (cp?.fechaFin) {
        const ahora = new Date();
        const fin = new Date(cp.fechaFin);
        estadoPlan = fin >= ahora ? 'Activo' : 'Vencido';
      }
      // Usar fechaFin en el mapeo
      const fechaRegistro = cp?.fechaFin ?? null;
      return {
        usuario: c.usuario,
        planNombre,
        estadoPlan,
        fechaRegistro,
      };
    });
  }
}
