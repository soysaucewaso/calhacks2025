import { NextRequest, NextResponse } from 'next/server'

// Global storage for demo purposes
// In production, you would use a database
declare global {
  var employeeMistakesStorage: any[] | undefined
}

if (!global.employeeMistakesStorage) {
  global.employeeMistakesStorage = []
}

export async function GET() {
  return NextResponse.json(global.employeeMistakesStorage)
}

export async function POST(request: NextRequest) {
  try {
    const mistake = await request.json()
    
    // Add the new mistake to our storage
    global.employeeMistakesStorage.push(mistake)
    
    return NextResponse.json(mistake, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save employee mistake' },
      { status: 500 }
    )
  }
}
