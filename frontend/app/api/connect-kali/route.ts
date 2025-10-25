import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return dummy success response for demo
    return NextResponse.json({
      success: true,
      message: "Successfully connected to Kali Linux VM (Demo Mode)",
      output: "Connection successful - Demo Mode",
    });
  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    }, { status: 500 });
  }
}
