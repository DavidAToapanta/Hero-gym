import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClienteModule } from './cliente/cliente.module';

@Module({
  imports: [UsuariosModule,
            PrismaModule,
            AuthModule,
            ClienteModule
  ]
})
export class AppModule {}
