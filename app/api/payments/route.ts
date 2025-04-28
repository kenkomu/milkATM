import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Payment {
  timestamp?: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const response = await fetch('https://darajaapi-callback.onrender.com/payments', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const sanitizedData = (data as Payment[]).filter((payment) => {
      if (!payment.timestamp) {
        console.warn('Missing timestamp, skipping payment:', payment);
        return false;
      }

      const date = new Date(payment.timestamp);
      const isValid = !isNaN(date.getTime());
      if (!isValid) {
        console.warn('Invalid timestamp detected and skipped:', payment.timestamp);
      }
      return isValid;
    });

    return NextResponse.json(sanitizedData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);

    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
