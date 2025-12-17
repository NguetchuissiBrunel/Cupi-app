import { NextResponse } from 'next/server';
import { cupidAlgorithm } from '@/lib/matchingAlgorithm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username requis' },
        { status: 400 }
      );
    }

    const matchResult = await cupidAlgorithm.checkMatch(username);

    return NextResponse.json({
      success: true,
      ...matchResult,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Error in match check API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}