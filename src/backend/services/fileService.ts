import sharp from 'sharp';
import { NextRequest } from 'next/server';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ProcessedImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export class FileService {
  static async processUploadedImage(file: File): Promise<ProcessedImage> {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    try {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process image with Sharp
      const processedBuffer = await sharp(buffer)
        .resize(1024, 1024, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 90,
          mozjpeg: true 
        })
        .toBuffer();

      return {
        buffer: processedBuffer,
        mimetype: 'image/jpeg',
        size: processedBuffer.length,
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async extractImageFromFormData(request: NextRequest): Promise<File | null> {
    try {
      const formData = await request.formData();
      const file = formData.get('characterReferenceImage') as File;
      
      if (!file || file.size === 0) {
        return null;
      }

      return file;
    } catch (error) {
      throw new Error(`Failed to extract image from form data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static validateImageFile(file: File): void {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (file.size === 0) {
      throw new Error('Empty file provided');
    }
  }
}
