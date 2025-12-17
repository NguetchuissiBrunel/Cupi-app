import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import CallSignal from '@/models/CallSignal';

export async function POST(request: Request) {
    try {
        const { sender, receiver, type, data } = await request.json();
        await connectDB();

        await CallSignal.create({
            sender,
            receiver,
            type,
            data
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Signal error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) return NextResponse.json({ signals: [] });

        await connectDB();

        // Get signals sent TO this user
        // Delete them after reading to ensure "exact once" delivery logic loosely
        const signals = await CallSignal.find({ receiver: username });

        if (signals.length > 0) {
            // Clean up retrieved signals so we don't process them twice
            await CallSignal.deleteMany({
                _id: { $in: signals.map(s => s._id) }
            });
        }

        return NextResponse.json({ signals });

    } catch (error) {
        return NextResponse.json({ error: 'Signal error' }, { status: 500 });
    }
}
