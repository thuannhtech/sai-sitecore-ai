import { NextResponse } from 'next/server';
import { formatTaxPercentage, getCommerceTaxRate } from 'src/lib/commerce-settings';

export async function GET() {
  const taxRate = await getCommerceTaxRate();

  return NextResponse.json({
    ok: true,
    taxRate,
    taxLabel: formatTaxPercentage(taxRate),
  });
}
