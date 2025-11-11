import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  crear(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.crear(dto);
  }

  @Get()
  listar(@Query('rol') rol?: string) {
    return this.usuariosService.findByRol(rol);
  }

  @Get('counts')
  conteos() {
    return this.usuariosService.counts();
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.usuariosService.eliminar(+id);
  }
}
