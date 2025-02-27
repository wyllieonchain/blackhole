import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const videoPath = path.join(process.cwd(), 'public', 'spacevideoLoop.mp4');
    const videoBuffer = fs.readFileSync(videoPath);
    
    // Set cache control headers for 1 week (604800 seconds)
    const response = new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=604800, immutable',
        'Content-Length': videoBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error serving video:', error);
    return new NextResponse('Video not found', { status: 404 });
  }
} 