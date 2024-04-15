import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from 'src/iam/auth/decorators/skip-auth.decorator';
import { PaymentService } from './payment.service';
import { ActiveUser } from 'src/iam/decorator/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { PaymentInitiationDto } from './dto/payment-initiation.dto';

@Controller({
  path: 'payment',
  version: '1',
})
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate-transaction')
  initiatePayment(
    @Body() paymentInitiationDto: PaymentInitiationDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.paymentService.initiatePayment(paymentInitiationDto, user);
  }

  @Public()
  @Post('paystack/callback')
  paystackCallback(@Body() paystackCallbackBody) {
    return this.paymentService.paystackCallback(paystackCallbackBody);
  }

  @Public()
  @Get('paystack/success')
  paystackSuccess() {
    return this.paymentService.paystackSuccess();
  }
}
