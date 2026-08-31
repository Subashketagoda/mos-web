import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'videos', 'negombo-hero-bg.mp4');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const nodeStream = fs.createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(nodeStream);

      const headers = new Headers();
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Length', chunksize.toString());
      headers.set('Content-Type', 'video/mp4');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');

      return new NextResponse(webStream as any, {
        status: 206,
        headers,
      });
    } else {
      const nodeStream = fs.createReadStream(filePath);
      const webStream = Readable.toWeb(nodeStream);
      const headers = new Headers();
      headers.set('Content-Length', fileSize.toString());
      headers.set('Content-Type', 'video/mp4');
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');

      return new NextResponse(webStream as any, {
        status: 200,
        headers,
      });
    }
  } catch (error: any) {
    console.error('Error streaming video:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
