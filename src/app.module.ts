import { Module } from '@nestjs/common';
import { BrevoModule } from './brevo/brevo.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    BrevoModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.rabbitmq', '.env'],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
