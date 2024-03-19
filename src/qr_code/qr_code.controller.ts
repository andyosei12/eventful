import { Controller, Get, Param } from '@nestjs/common';
import { QrCodeService } from './qr_code.service';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller({
  path: 'qr-code',
  version: '1',
})
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @ApiOkResponse({ description: 'QR code generated successfully' })
  @Get(':ticketId')
  generateQrCode(@Param('ticketId') ticketId: string) {
    return this.qrCodeService.generateQrCode(ticketId);
  }
}
