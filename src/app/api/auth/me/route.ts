import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      return NextResponse.json(
        { success: false, error: error || 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(authUser.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}
