import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './weather.schema';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
  constructor(@InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>) {}

  async findAll(): Promise<Weather[]> {
    // Retorna os últimos 20 registros, ordenados do mais recente para o mais antigo
    return this.weatherModel.find().sort({ _id: -1 }).limit(20).exec();
  }

  async getInsights() {
    // Busca os últimos 10 registros para análise
    const data = await this.weatherModel.find().sort({ _id: -1 }).limit(10).exec();

    if (!data || data.length === 0) {
      return {
        summary: 'Aguardando dados suficientes para análise...',
        trend: 'Indefinida',
        alert: 'Sem dados'
      };
    }

    const current = data[0];
    const previous = data[1] || current;

    // Lógica simples de tendência
    let trend = 'Estável';
    if (current.temperature > previous.temperature) trend = 'Subindo 📈';
    else if (current.temperature < previous.temperature) trend = 'Caindo 📉';

    // Lógica de alertas
    let alert = 'Condições Normais ✅';
    if (current.temperature > 30) alert = 'Alerta de Calor ☀️';
    else if (current.windspeed > 25) alert = 'Vento Forte 💨';

    const summary = `A temperatura atual é de ${current.temperature}°C com ventos de ${current.windspeed} km/h.`;

    return { summary, trend, alert };
  }

  async getCsv(): Promise<string> {
    const data = await this.weatherModel.find().sort({ _id: -1 }).limit(100).exec();
    
    const fields = ['timestamp', 'temperature', 'windspeed', 'latitude', 'longitude'];
    const opts = { fields };
    
    // Formata a data para ficar legível
    const formattedData = data.map(doc => ({
      ...doc.toObject(),
      timestamp: new Date(doc.timestamp * 1000).toLocaleString('pt-BR')
    }));

    const parser = new Parser(opts);
    return parser.parse(formattedData);
  }

  async getExcel(): Promise<Buffer> {
    const data = await this.weatherModel.find().sort({ _id: -1 }).limit(100).exec();
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados Climáticos');

    worksheet.columns = [
      { header: 'Data/Hora', key: 'timestamp', width: 25 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 15 },
      { header: 'Vento (km/h)', key: 'windspeed', width: 15 },
      { header: 'Latitude', key: 'latitude', width: 15 },
      { header: 'Longitude', key: 'longitude', width: 15 },
    ];

    data.forEach((doc) => {
      worksheet.addRow({
        ...doc.toObject(),
        timestamp: new Date(doc.timestamp * 1000).toLocaleString('pt-BR')
      });
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}