import { NextResponse } from 'next/server';

export async function GET() {
    // Since this is server-side, we can't access the client-side Zustand store
    // But we can test if our APIs are working
    try {
        const cvsResponse = await fetch('http://localhost:3002/api/cvs');
        const cvInfoResponse = await fetch('http://localhost:3002/api/cv-info');

        const cvsData = cvsResponse.ok ? await cvsResponse.json() : null;
        const cvInfoData = cvInfoResponse.ok ? await cvInfoResponse.json() : null;

        return NextResponse.json({
            cvs: {
                status: cvsResponse.status,
                count: cvsData?.length || 0,
                data: cvsData?.slice(0, 2) // First 2 CVs for brevity
            },
            cvInfo: {
                status: cvInfoResponse.status,
                hasData: !!cvInfoData
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
