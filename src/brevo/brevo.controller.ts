import { AccessJwtAuthGuard } from './../guards/jwt-access-auth.guard';
import {
  Controller,
  Request,
  UseGuards,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { BrevoService } from './brevo.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { RequestUser, VerifyOTP } from './dto/bravo';

@Controller('brevo')
@UseGuards(AccessJwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Brevo')
export class BrevoController {
  constructor(private readonly brevoService: BrevoService) {}

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @Get('/otp/generate')
  @ApiOperation({ summary: 'Send OTP to Email' })
  async sendOtpToEmail(@Request() req: RequestUser) {
    return await this.brevoService.generateOTP(req.user);
  }

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @Post('/otp/verify')
  @ApiBody({ type: VerifyOTP })
  @ApiOperation({ summary: 'Verify OTP to Email' })
  async verifyOtpToEmail(
    @Request() req: RequestUser,
    @Body() verifyData: VerifyOTP,
  ) {
    return await this.brevoService.verifyOTP(req.user, verifyData.otp);
  }
}
