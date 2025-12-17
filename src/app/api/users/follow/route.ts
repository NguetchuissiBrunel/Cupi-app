import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';

export async function POST(request: Request) {
    try {
        const { currentUser, targetUsername } = await request.json();

        if (!currentUser || !targetUsername) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ username: currentUser });
        const target = await User.findOne({ username: targetUsername });

        if (!user || !target) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Initialize arrays if they don't exist
        if (!user.following) user.following = [];
        if (!target.followers) target.followers = [];

        // Toggle follow
        const isFollowing = user.following.includes(targetUsername);

        if (isFollowing) {
            // Unfollow
            user.following = user.following.filter((u: string) => u !== targetUsername);
            target.followers = target.followers.filter((u: string) => u !== currentUser);
        } else {
            // Follow
            user.following.push(targetUsername);
            target.followers.push(currentUser);
        }

        await user.save();
        await target.save();

        return NextResponse.json({
            success: true,
            isFollowing: !isFollowing,
            followerCount: target.followers.length
        });

    } catch (error) {
        console.error('Error toggling follow:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
