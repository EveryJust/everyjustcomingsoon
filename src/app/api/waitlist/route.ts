import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_WEB_APP_URL;
    
    // If the user hasn't set up the Google Web App URL yet, we'll just simulate success 
    // so they can see the frontend working while they set it up.
    if (!scriptUrl) {
      console.warn("GOOGLE_WEB_APP_URL is not set. Simulating success for:", email);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return NextResponse.json({ success: true, simulated: true });
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Appending a timestamp along with the email for Google Sheets
      body: JSON.stringify({ email, timestamp: new Date().toISOString() }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      console.error("Google Apps Script responded with status:", response.status);
      return NextResponse.json({ error: 'Failed to save to waitlist' }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in waitlist API:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
