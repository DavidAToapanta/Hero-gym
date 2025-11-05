import { Controller, Get, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('ingresos')
  async obtenerIngresos(@Query('periodo') periodo: 'dia' | 'mes' | 'anio') {
    const datos = await this.estadisticasService.obtenerIngresos(periodo || 'mes');
    return {
      labels: datos.map(d => d.label),
      data: datos.map(d => d.total),
    };
  }
}
