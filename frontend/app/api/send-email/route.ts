import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/ses';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, htmlBody, textBody } = await request.json();

    if (!to || !subject || !htmlBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, htmlBody' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: Array.isArray(to) ? to : [to],
      subject,
      htmlBody,
      textBody,
    });

    return NextResponse.json({ 
      success: true, 
      messageId: result.MessageId 
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}