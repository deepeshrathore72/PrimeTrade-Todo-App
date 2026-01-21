import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
