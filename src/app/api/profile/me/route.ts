import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ username }).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
