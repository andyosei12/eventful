import { Module } from '@nestjs/common';
import { QrCodeController } from './qr_code.controller';
import { QrCodeService } from './qr_code.service';

@Module({
  controllers: [QrCodeController],
  providers: [QrCodeService]
})
export class QrCodeModule {}
