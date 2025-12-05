import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];
        const fileExt = extname(file.originalname).toLowerCase();
        try {
          if (!allowedExtensions.includes(fileExt)) {
            throw new BadRequestException(
              `Only JPEG, JPG, PNG, SVG formats can be uploaded`,
            );
          }
          callback(null, true);
        } catch (error) {
          callback(error, false);
        }
      },
    }),
  )
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      const data = files.map((file) => ({
        originalname: file.originalname,
        filename: file.filename,
        path: `http://localhost:3000/static/${file.filename}`,
      }));

      return {
        status_code: 200,
        message: 'success',
        data,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
