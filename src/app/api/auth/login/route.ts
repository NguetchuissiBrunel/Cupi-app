import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
        }

        const token = await createSession({
            userId: user._id,
            username: user.username
        });

        const response = NextResponse.json({
            success: true,
            user: {
                username: user.username,
                image: user.image
            }
        });

        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
