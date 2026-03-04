import { getFilterOptions } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const options = getFilterOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error('Failed to get filter options:', error);
    return NextResponse.json(
      { error: 'Failed to load filter options' },
      { status: 500 }
    );
  }
}
