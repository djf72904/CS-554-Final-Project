//@ts-ignore
import gm from 'gm';
import path from 'path';
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';

const GraphicsMagick = gm.subClass({ imageMagick: false });

export async function addSoldOverlay(imageUrl: string): Promise<string> {
    const inputPath = path.join(process.cwd(), 'public', 'listings', imageUrl.replace(/^\/+/, ''));
    const filename = `${uuidv4()}_sold.jpg`;
    const outputPath = path.join(process.cwd(), 'public', 'listings', filename);
  
    return new Promise((resolve, reject) => {
      GraphicsMagick(inputPath)
        .fill('#FF000088') 
        .drawRectangle(0, 0, 512, 512)
        .fill('#FFFFFF')
        .font('Helvetica', 72)
        .drawText(100, 300, 'SOLD')
        .write(outputPath, (err: any) => {
          if (err) return reject(err);
          resolve(`/listings/${filename}`);
        });
    });
  }