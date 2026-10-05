import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchReviewsFromDb, 
  createReview, 
  setReviewStatus, 
  removeReview, 
  upvoteReviewHelpful, 
  computeReviewStats 
} from '@/utils/reviewsStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;
    const productSlug = searchParams.get('productSlug') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const orderNumber = searchParams.get('orderNumber') || undefined;
    const status = searchParams.get('status') || undefined;

    const reviews = await fetchReviewsFromDb({
      productId,
      productSlug,
      userId,
      orderNumber,
      status,
    });

    const stats = computeReviewStats(reviews);

    return NextResponse.json({
      success: true,
      reviews,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.rating || !body.comment) {
      return NextResponse.json(
        { success: false, error: 'Rating and comment are required.' },
        { status: 400 }
      );
    }

    const review = await createReview(body);

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required.' },
        { status: 400 }
      );
    }

    if (action === 'helpful') {
      const helpfulCount = await upvoteReviewHelpful(id);
      return NextResponse.json({ success: true, helpfulCount });
    }

    if (status) {
      const ok = await setReviewStatus(id, status);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or status' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required.' },
        { status: 400 }
      );
    }

    const ok = await removeReview(id);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}
