import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';

export async function POST(request: Request) {
    try {
        const { username } = await request.json();
        if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

        await connectDB();

        await User.findOneAndUpdate(
            { username },
            {
                lastSeen: new Date(),
                status: 'online'
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating presence:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
