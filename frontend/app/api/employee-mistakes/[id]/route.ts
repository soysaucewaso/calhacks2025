import { NextRequest, NextResponse } from 'next/server'

// Global storage for demo purposes
// In production, you would use a database
declare global {
  var employeeMistakesStorage: any[] | undefined
}

if (!global.employeeMistakesStorage) {
  global.employeeMistakesStorage = []
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const id = params.id
    
    // Find and update the mistake
    const mistakeIndex = global.employeeMistakesStorage.findIndex(m => m.id === id)
    
    if (mistakeIndex === -1) {
      return NextResponse.json(
        { error: 'Mistake not found' },
        { status: 404 }
      )
    }
    
    global.employeeMistakesStorage[mistakeIndex].status = status
    
    return NextResponse.json(global.employeeMistakesStorage[mistakeIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update mistake status' },
      { status: 500 }
    )
  }
}
