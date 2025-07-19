import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientePlanDto } from './dto/create-cliente-plan.dto';
import { UpdateClientePlanDto } from './dto/update-cliente-plan.dto';

@Injectable()
export class ClientePlanService {
    constructor(private prisma: PrismaService){}

    create(dto: CreateClientePlanDto) {
        return this.prisma.clientePlan.create({
          data: {
            fechaInicio: new Date(dto.fechaInicio),
            fechaFin: new Date(dto.fechaFin),
            diaPago: dto.diaPago,
            activado: dto.activado,
            cliente: { connect: { id: dto.clienteId } },
            plan: { connect: { id: dto.planId } },
          },
        });
      }

    findAll(){
        return this.prisma.clientePlan.findMany();
    }

    async findOne(id: number) {
        const clientePlan = await this.prisma.clientePlan.findUnique({ where: { id } });
        if (!clientePlan) throw new NotFoundException('ClientePlan no encontrado');
        return clientePlan;
      }

    async update(id: number, dto: UpdateClientePlanDto) {
        await this.findOne(id);
        return this.prisma.clientePlan.update({
          where: { id },
          data: {
            fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
            fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
            diaPago: dto.diaPago,
            activado: dto.activado,
            cliente: dto.clienteId ? { connect: { id: dto.clienteId } } : undefined,
            plan: dto.planId ? { connect: { id: dto.planId } } : undefined,
          },
        });
      }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.clientePlan.delete({ where: { id } });
      }
}
