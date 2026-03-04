import { getMapMarkers } from '@/lib/data';
import { PropertyFilters } from '@/types/property';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: PropertyFilters = {
      gugun: searchParams.get('gugun')?.split(',').filter(Boolean) || undefined,
      buildingType: searchParams.get('buildingType')?.split(',').filter(Boolean) || undefined,
      architecture: searchParams.get('architecture')?.split(',').filter(Boolean) || undefined,
      minDeposit: searchParams.get('minDeposit') ? parseInt(searchParams.get('minDeposit')!, 10) : undefined,
      maxDeposit: searchParams.get('maxDeposit') ? parseInt(searchParams.get('maxDeposit')!, 10) : undefined,
      minMonthlyRent: searchParams.get('minMonthlyRent') ? parseInt(searchParams.get('minMonthlyRent')!, 10) : undefined,
      maxMonthlyRent: searchParams.get('maxMonthlyRent') ? parseInt(searchParams.get('maxMonthlyRent')!, 10) : undefined,
      minArea: searchParams.get('minArea') ? parseFloat(searchParams.get('minArea')!) : undefined,
      maxArea: searchParams.get('maxArea') ? parseFloat(searchParams.get('maxArea')!) : undefined,
    };

    const data = getMapMarkers(filters);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to get markers:', error);
    return NextResponse.json(
      { error: 'Failed to load markers' },
      { status: 500 }
    );
  }
}
