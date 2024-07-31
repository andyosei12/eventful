import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import cloudinaryConfig from './config/cloudinary.config';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(cloudinaryConfig.KEY)
    private readonly cloudinaryConfiguration: ConfigType<
      typeof cloudinaryConfig
    >,
  ) {
    cloudinary.config({
      cloud_name: this.cloudinaryConfiguration.cloudName,
      api_key: this.cloudinaryConfiguration.apiKey,
      api_secret: this.cloudinaryConfiguration.secretKey,
    });
  }

  async uploadImage(
    filePath: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async updateImage(filePath:string, public_id: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve,reject) => {
      cloudinary.uploader.upload(filePath, {
        public_id
      }, (error,result) => {
        if(error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  async getImageDetails(publicId: string) {
    return await cloudinary.api
      .resource(publicId)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw new NotFoundException(`Resource with ${publicId} not found`);
      });
  }

  async deleteImage(publicId: string) {
    return await cloudinary.uploader.destroy(publicId).then((res) => {
      if (res.result === 'ok') return res;

      throw new NotFoundException(`Resource with ${publicId} not found`);
    });
  }
}
