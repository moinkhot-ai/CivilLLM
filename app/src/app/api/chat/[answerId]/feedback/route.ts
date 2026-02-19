import { NextRequest, NextResponse } from 'next/server';

// POST - Submit feedback for an answer
export async function POST(
    request: NextRequest,
    { params }: { params: { answerId: string } }
) {
    try {
        const { type, comment } = await request.json();
        const { answerId } = params;

        if (!type || !['HELPFUL', 'NOT_HELPFUL', 'FLAG'].includes(type)) {
            return NextResponse.json(
                { error: 'Valid feedback type is required' },
                { status: 400 }
            );
        }

        // In production, this would save to database
        console.log('Feedback received:', { answerId, type, comment });

        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully',
        });
    } catch (error) {
        console.error('Feedback API error:', error);
        return NextResponse.json(
            { error: 'An error occurred while submitting feedback' },
            { status: 500 }
        );
    }
}
