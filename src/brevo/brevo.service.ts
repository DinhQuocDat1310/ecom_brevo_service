import {
  Injectable,
  Inject,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { UserSignIn } from './dto/bravo';
import { lastValueFrom } from 'rxjs';
import {
  OTP_TTL_5_MINS,
  TIMES_VERIFY,
  USER_SERVICE,
} from './constants/service';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import Brevo = require('@getbrevo/brevo');

@Injectable()
export class BrevoService {
  constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  getUserByEmailorPhonenumber = async (username: string): Promise<any> => {
    // Send message to user-microservice to notify them we need to find user by email or phonenumber
    return await lastValueFrom(
      this.userClient.send('find_user_by_email_or_phone', username),
    );
  };

  configFormatEmail = async (
    reqUser: UserSignIn,
    apiInstance: any,
  ): Promise<any> => {
    const { email, username } = reqUser;
    try {
      const getExistingOTP = await this.cacheManager.get(email);
      if (getExistingOTP)
        throw new BadRequestException(
          `OTP already send. Please wait ${5} minute(s) to get new OTP`,
        );
      const otp = this.generateRandomSixDigitNumber();
      await this.cachingOTPCode(email, otp.toString());
      await apiInstance.sendTransacEmail({
        sender: {
          email: this.configService.get('BREVO_EMAIL_ADMIN'),
          name: this.configService.get('BREVO_NAME_ADMIN'),
        },
        subject: 'Shopee V2',
        htmlContent:
          '<!DOCTYPE html><html><body><h1>Shopee</h1><p>New things</p></body></html>',
        params: {
          greeting: 'Greeting',
          headline: 'Headline',
        },
        messageVersions: [
          {
            to: [
              {
                email,
                name: username,
              },
            ],
            htmlContent: `
            <!DOCTYPE html>
            <html>
              <body>
                <h1>Welcome to become we're partners!</h1>
                <p>Your code: ${otp}</p>
              </body>
            </html>`,
            subject: 'Welcome to Shopee Version 2.0',
          },
        ],
      });
      return {
        message:
          'Send verify email successfully. Please check your email or spam folder',
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  };

  configConnectionBrevo = async (): Promise<any> => {
    const defaultBrevoClient = Brevo.ApiClient.instance;
    const apiKey = defaultBrevoClient.authentications['api-key'];
    apiKey.apiKey = this.configService.get('BREVO_API_KEY');
    return new Brevo.TransactionalEmailsApi();
  };

  generateOTP = async (reqUser: UserSignIn): Promise<string> => {
    const apiInstance = await this.configConnectionBrevo();
    return await this.configFormatEmail(reqUser, apiInstance);
  };

  generateRandomSixDigitNumber(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  cachingOTPCode = async (key: string, value: string): Promise<any> => {
    return await this.cacheManager.set(
      key,
      {
        otp: value,
        times: TIMES_VERIFY,
      },
      OTP_TTL_5_MINS,
    );
  };

  verifyOTP = async (reqUser: UserSignIn, otp: string) => {
    const email = reqUser.email;
    const getOTP: { otp: string; times: number } = await this.cacheManager.get(
      email,
    );

    if (!getOTP || getOTP.otp !== otp) {
      if (getOTP) {
        getOTP.times--;
        if (getOTP.times > 0) {
          return {
            message: `Your OTP code is wrong. Remains ${getOTP.times} time(s)`,
          };
        }
      }
      await this.cacheManager.del(email);
      throw new BadRequestException('Your OTP code is invalid');
    }

    await this.cacheManager.del(email);
    const result = await lastValueFrom(
      this.userClient.send('verify_email_with_otp', email),
    );

    if (result) {
      return {
        message: 'Verify email successfully',
      };
    }
  };
}
