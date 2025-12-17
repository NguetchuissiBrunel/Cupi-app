import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { hashPassword, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password, image, bio, age, gender, preferences } = body;

        if (!username || !email || !password || !age || !gender || !preferences) {
            return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
        }

        await connectDB();

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Pseudo ou email déjà utilisé' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            image,
            bio,
            age,
            gender,
            preferences,
            answers: [], // Will be filled later
            questions: [], // Will be filled later
            status: 'waiting'
        });

        const session = await createSession({
            userId: newUser._id,
            username: newUser.username
        });

        // We can't set cookies directly in response in app router easily for client components to read immediately
        // but in server actions we can. Here we will return it and let client handle, or set HttpOnly cookie.

        // For simplicity, we return success and handle login on client side after registration

        return NextResponse.json({ success: true, user: { username } });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
