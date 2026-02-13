import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from 'src/common/guard/jwt-auth.guard';
import * as fs from 'fs';
import { IFile } from 'src/common/interface';

@UseGuards(JwtGuard)
@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const folder = req.query.folder as string;

          const allowedFolders = [
            'chat',
            'profile',
            'order',
            'opinion',
            'service',
          ];

          if (!allowedFolders.includes(folder)) {
            return callback(
              new BadRequestException(
                `Invalid folder. Allowed: ${allowedFolders.join(', ')}`,
              ),
              null,
            );
          }

          const uploadPath = `./uploads/${folder}`;

          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          callback(null, uploadPath);
        },
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

        if (!allowedExtensions.includes(fileExt)) {
          return callback(
            new BadRequestException(
              `Only JPEG, JPG, PNG, SVG formats can be uploaded`,
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  uploadFiles(
    @UploadedFiles()
    files: IFile[],
    @Query('folder') folder: string,
  ) {
    if (!folder) {
      throw new BadRequestException('folder query parameter is required');
    }

    try {
      const data = files.map((file) => ({
        filename: file.filename,
        path: `http://localhost:3000/static/${folder}/${file.filename}`,
      }));

      return {
        status_code: 200,
        message: 'success',
        data,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('File upload error');
    }
  }
}
