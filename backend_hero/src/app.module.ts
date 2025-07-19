import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClienteModule } from './cliente/cliente.module';
import { ProductoModule } from './producto/producto.module';
import { PlanModule } from './plan/plan.module';
import { ClientePlanModule } from './cliente-plan/cliente-plan.module';
import { PagoModule } from './pago/pago.module';
import { DeudaModule } from './deuda/deuda.module';

@Module({
  imports: [UsuariosModule,
            PrismaModule,
            AuthModule,
            ClienteModule,
            ProductoModule,
            PlanModule,
            ClientePlanModule,
            PagoModule,
            DeudaModule
  ]
})
export class AppModule {}
