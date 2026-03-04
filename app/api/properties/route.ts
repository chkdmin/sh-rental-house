import { filterAndSortProperties, getPropertyById } from '@/lib/data';
import { PropertyFilters } from '@/types/property';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Check if ID is provided (single property)
    const id = searchParams.get('id');
    if (id) {
      const property = getPropertyById(id);
      if (!property) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(property);
    }

    // Parse filters
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
      sort: (searchParams.get('sort') as PropertyFilters['sort']) || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };

    const result = filterAndSortProperties(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get properties:', error);
    return NextResponse.json(
      { error: 'Failed to load properties' },
      { status: 500 }
    );
  }
}
