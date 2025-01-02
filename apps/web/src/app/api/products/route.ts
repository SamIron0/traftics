import { getProducts } from "@/utils/supabase/stripe_queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await getProducts();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
} 