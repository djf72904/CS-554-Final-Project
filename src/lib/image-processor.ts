//@ts-ignore
import gm from 'gm';
import path from 'path';
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';

const GraphicsMagick = gm.subClass({ imageMagick: false });

export async function addSoldOverlay(inputPath: string): Promise<string> {
    console.log("addSoldOverlay called by:", inputPath);
    const filename = `${uuidv4()}_sold.jpg`;
    const outputPath = path.join(process.cwd(), 'public', 'listings', filename);
    const fontPath = path.join(process.cwd(), 'public', 'Helvetica-Bold.ttf');

    return new Promise((resolve, reject) => {
      GraphicsMagick(inputPath)
        .fill('#80808088') 
        .drawRectangle(0, 0, 512, 512)
        .fill('#FFFFFF')
        .font(fontPath, 72)
        .gravity("Center")
        .drawText(0, 0, 'SOLD')
        .write(outputPath, (err: any) => {
          if (err) return reject(err);
          resolve(`/listings/${filename}`);
        });
    });
  }