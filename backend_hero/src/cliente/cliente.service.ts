import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { dot } from 'node:test/reporters';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
    constructor(private prisma: PrismaService){}

    create(dto: CreateClienteDto){
        return this.prisma.cliente.create({ data: dto});
    }

    findAll() {
        return this.prisma.cliente.findMany();
    }

    async findOne(id: number){
        const cliente = await this.prisma.cliente.findUnique({
            where: { id }
        });
        if (!cliente) throw new NotFoundException('Cliente no encontrado');
        return cliente;
    }

    async update(id: number, dto: UpdateClienteDto){
        await this.findOne(id);
        return this.prisma.cliente.update({ where: { id}, data: dto});
    }

    async remove(id: number){
        await this.findOne(id);
        return this.prisma.cliente.delete({ where: { id}})
    }
    
}
