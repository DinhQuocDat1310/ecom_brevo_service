import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PayloadDTO {
  username: string;
  userId: string;
}

export class VerifyOTP {
  @IsString()
  @ApiProperty({
    description: 'OTP in email',
  })
  otp: string;
}

export class RequestUser {
  user: UserSignIn;
}

export class UserSignIn {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  status: string;
  gender: string;
  dateOfBirth: Date;
  avatar: string;
  isActive: boolean;
  provider: string;
  salesmanId: string;
}
