import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Message from '@/models/Message';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const user1 = searchParams.get('user1');
        const user2 = searchParams.get('user2');

        if (!user1 || !user2) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        await connectDB();

        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ createdAt: 1 });

        return NextResponse.json({ success: true, messages });

    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sender, receiver, content } = body;

        if (!sender || !receiver || !content) {
            return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
        }

        await connectDB();

        const newMessage = await Message.create({
            sender,
            receiver,
            content,
            read: false
        });

        return NextResponse.json({ success: true, message: newMessage });

    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
