import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ status: 'ok', env: { openai: !!process.env.OPENAI_API_KEY } });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        return NextResponse.json({ status: 'ok', received: body, env: { openai: !!process.env.OPENAI_API_KEY } });
    } catch {
        return NextResponse.json({ status: 'error', message: 'bad json' }, { status: 400 });
    }
}
