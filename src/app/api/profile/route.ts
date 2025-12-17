import { NextResponse } from 'next/server';
import { cupidAlgorithm } from '@/lib/matchingAlgorithm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, answers, questions } = body;

    if (!username || !answers || !questions) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const userProfile = {
      username,
      answers,
      questions,
      timestamp: Date.now()
    };

    const matchResult = await cupidAlgorithm.addUser(userProfile);

    if (matchResult.matchFound) {
      return NextResponse.json({
        success: true,
        matchFound: true,
        matchId: matchResult.matchId,
        matchName: matchResult.matchName,
        compatibility: matchResult.compatibility,
        message: matchResult.message,
        notification: {
          type: 'IMMEDIATE',
          sound: 'cupid-arrow'
        }
      });
    }

    return NextResponse.json({
      success: true,
      matchFound: false,
      message: matchResult.message,
      notification: {
        type: 'WAITING',
        checkInterval: 5000
      }
    });

  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}