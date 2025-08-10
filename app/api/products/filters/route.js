import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    
    const [categories, brands, models] = await Promise.all([
      Product.distinct('category'),
      Product.distinct('brand'),
      Product.distinct('model'),
    ]);
    
    return Response.json({
      categories: categories.filter(Boolean),
      brands: brands.filter(Boolean),
      models: models.filter(Boolean),
    });
    
  } catch (error) {
    console.error('Filters fetch error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}