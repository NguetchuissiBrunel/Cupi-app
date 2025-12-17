import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const currentUser = searchParams.get('currentUser') || '';

        await connectDB();

        // Build filter: exclude current user, optional regex if query exists
        const filter: Record<string, any> = {
            username: { $ne: currentUser }
        };

        if (query) {
            filter.username = {
                $regex: query,
                $options: 'i',
                $ne: currentUser
            };
        }

        const users = await User.find(filter)
            .select('username image age gender bio')
            .limit(50);

        // If current user is provided, check follow status
        let results: Record<string, any>[] = users;
        if (currentUser) {
            const userDoc = await User.findOne({ username: currentUser });
            if (userDoc && userDoc.following) {
                results = users.map(u => ({
                    ...u.toObject(),
                    isFollowing: userDoc.following?.includes(u.username)
                }));
            }
        }

        return NextResponse.json({ users: results });

    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
