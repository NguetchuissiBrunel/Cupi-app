import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Match from '@/models/Match';
import User from '@/models/User';
import Message from '@/models/Message';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        await connectDB();

        // 1. Find Algorithm Matches
        const matches = await Match.find({
            users: username
        }).sort({ createdAt: -1 });

        // 2. Find Mutual Follows (Friends)
        const currentUserDoc = await User.findOne({ username });
        let friends: string[] = [];

        if (currentUserDoc && currentUserDoc.following && currentUserDoc.following.length > 0) {
            const myFollows = await User.find({
                username: { $in: currentUserDoc.following },
                following: username
            });
            friends = myFollows.map(u => u.username);
        }

        const allContactNames = new Set<string>();
        matches.forEach((m: { users: string[] }) => {
            const other = m.users.find((u: string) => u !== username);
            if (other) allContactNames.add(other);
        });
        friends.forEach(f => allContactNames.add(f));

        const matchesData = await Promise.all(Array.from(allContactNames).map(async (otherUsername) => {
            const otherUser = await User.findOne({ username: otherUsername }).select('image lastSeen');

            const lastMessage = await Message.findOne({
                $or: [
                    { sender: username, receiver: otherUsername },
                    { sender: otherUsername, receiver: username }
                ]
            }).sort({ createdAt: -1 });

            const unreadCount = await Message.countDocuments({
                sender: otherUsername,
                receiver: username,
                read: false
            });

            // Calculate Online Status (active in last 5 minutes)
            const isOnline = otherUser?.lastSeen && (new Date().getTime() - new Date(otherUser.lastSeen).getTime() < 5 * 60 * 1000);

            return {
                username: otherUsername,
                avatar: otherUser?.image,
                lastMessage: lastMessage ? lastMessage.content : "Nouvelle connexion !",
                timestamp: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Récemment",
                unreadCount,
                isOnline,
                lastSeen: otherUser?.lastSeen
            };
        }));

        return NextResponse.json({ success: true, matches: matchesData });

    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
