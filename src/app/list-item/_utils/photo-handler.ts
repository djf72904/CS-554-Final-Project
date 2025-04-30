'use server'

import { promises as fs } from "fs";
import path from "path";

export const imageDownloadUrls = async (images: any) =>  await Promise.all(
    images.map(async (image: any, i: number) => {
        const fileName = `${Date.now()}-${image.name}`;
        const filePath = path.join(process.cwd(), "public", "listings", fileName);
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);
        return `/listings/${fileName}`;
    })
);