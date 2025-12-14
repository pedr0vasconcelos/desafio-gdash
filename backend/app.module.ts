import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { Weather, WeatherSchema } from './weather.schema';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost/gdash_db'),
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
    AuthModule,
    UsersModule,
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class AppModule {}