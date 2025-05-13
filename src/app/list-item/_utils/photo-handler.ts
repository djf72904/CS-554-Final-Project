'use server'
//@ts-ignore
import gm from 'gm';
import os from 'os';
//@ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from "fs";
import path from "path";

const GraphicsMagick = gm.subClass({ imageMagick: false });

export async function imageDownloadUrls(images: File[]): Promise<string[]> {
    const urls: string[] = [];

    for (const image of images) {
        const buffer = await image.arrayBuffer();
        const tempInputPath = path.join(os.tmpdir(), `${uuidv4()}_input.jpg`);
        const croppedFileName = `${uuidv4()}_cropped.jpg`;
        const outputPath = path.join(process.cwd(), "public", "listings", croppedFileName);
        await fs.writeFile(tempInputPath, Buffer.from(buffer));

        await new Promise<void>( (resolve, reject) => {
            GraphicsMagick(tempInputPath)
                .resize(512, 512, "^")
                .gravity("Center")
                .extent(512, 512)
                .noProfile()
                .write(outputPath, (err: any) => {
                    if (err) return reject(err)
                    resolve()
                });
        });

        urls.push(`/listings/${croppedFileName}`);
        fs.unlink(tempInputPath);
    }
    return urls;
} 
