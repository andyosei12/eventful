import { Controller, Delete, Get, Param } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { Public } from 'src/iam/auth/decorators/skip-auth.decorator';

@Controller({
  path: 'cloudinary/upload',
  version: '1',
})
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Public()
  @Get(':id')
  getImageDetails(@Param('id') id: string) {
    return this.cloudinaryService.getImageDetails(id);
  }

  @Public()
  @Delete(':id')
  deleteImage(@Param('id') id: string) {
    return this.cloudinaryService.deleteImage(id);
  }
}
