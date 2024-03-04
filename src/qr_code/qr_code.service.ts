import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQrCode(ticketId: string) {
    try {
      const url = await QRCode.toDataURL(`${ticketId}`);
      return {
        qr_code: url,
      };
    } catch (err) {
      throw new HttpException(
        'Error while generating QR code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
