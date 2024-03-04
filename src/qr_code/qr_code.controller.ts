import { Controller, Get, Param } from '@nestjs/common';
import { QrCodeService } from './qr_code.service';

@Controller('qr-code')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}
  @Get(':ticketId')
  generateQrCode(@Param('ticketId') ticketId: string) {
    return this.qrCodeService.generateQrCode(ticketId);
  }
}
