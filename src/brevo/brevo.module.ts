import { AccessTokenJwtStrategy } from './../strategies/access-token.jwt.strategy';
import { RabbitMQModule } from './../libs/common/src/rabbitmq/rabbitmq.module';
import { Module } from '@nestjs/common';
import { BrevoService } from './brevo.service';
import { BrevoController } from './brevo.controller';
import { RabbitMQService } from 'src/libs/common/src';
import { USER_SERVICE } from './constants/service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RabbitMQModule.register({
      name: USER_SERVICE,
    }),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [BrevoController],
  providers: [
    BrevoService,
    RabbitMQService,
    AccessTokenJwtStrategy,
    ConfigService,
  ],
})
export class BrevoModule {}
