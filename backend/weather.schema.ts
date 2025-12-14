import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ collection: 'weather' }) // Importante: define a coleção exata
export class Weather {
  @Prop()
  temperature: number;

  @Prop()
  windspeed: number;

  @Prop()
  latitude: string;

  @Prop()
  longitude: string;

  @Prop()
  timestamp: number;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);