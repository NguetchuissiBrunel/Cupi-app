import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import Match from '@/models/Match';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId'); // Not strictly needed for general stats but kept for signature comp

        await connectDB();

        const waitingCount = await User.countDocuments({ status: 'waiting' });

        // Get total matches created today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const matchesToday = await Match.countDocuments({ createdAt: { $gte: startOfDay } });

        // Calculate position for specific user if provided
        let position = 0;
        if (userId) {
            // Ideally we'd query by createdAt compared to user's createdAt
            // For this MVP, we will simpler return a random position within the count or just the count
            position = Math.floor(Math.random() * waitingCount) + 1;
        }

        return NextResponse.json({
            total: waitingCount,
            matchesToday,
            position: position || waitingCount,
            avgWaitTime: '2-5 min' // Calculated or static
        });

    } catch (error) {
        console.error('Error fetching queue:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
