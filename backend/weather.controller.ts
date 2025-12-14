import { Controller, Get, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Weather } from './weather.schema';
import { Response } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  findAll(): Promise<Weather[]> {
    return this.weatherService.findAll();
  }

  @Get('insights')
  getInsights() {
    return this.weatherService.getInsights();
  }

  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.weatherService.getCsv();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="weather_data.csv"');
    res.send(csv);
  }

  @Get('export.xlsx')
  async exportExcel(@Res() res: Response) {
    const buffer = await this.weatherService.getExcel();
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', 'attachment; filename="weather_data.xlsx"');
    res.send(buffer);
  }
}