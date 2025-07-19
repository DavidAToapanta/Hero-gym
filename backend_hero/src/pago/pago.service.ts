import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Injectable()
export class PagoService {
    constructor(private prisma: PrismaService){}

    create(dto: CreatePagoDto) {
        return this.prisma.pago.create({
          data: {
            monto: dto.monto,
            fecha: new Date(dto.fecha),
            clientePlan: { connect: { id: dto.clientePlanId } },
          },
        });
      }

      findAll() {
        return this.prisma.pago.findMany();
      }

      async findOne(id: number) {
        const pago = await this.prisma.pago.findUnique({ where: { id } });
        if (!pago) throw new NotFoundException('Pago no encontrado');
        return pago;
      }

      async update(id: number, dto: UpdatePagoDto) {
        await this.findOne(id);
        return this.prisma.pago.update({
          where: { id },
          data: {
            ...(dto.monto !== undefined && { monto: dto.monto }),
            ...(dto.fecha && { fecha: new Date(dto.fecha) }),
            ...(dto.clientePlanId !== undefined && {
              clientePlan: { connect: { id: dto.clientePlanId } },
            }),
          },
        });
      }

      async remove(id: number) {
        await this.findOne(id);
        return this.prisma.pago.delete({ where: { id } });
      }

}
