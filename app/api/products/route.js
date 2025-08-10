import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const model = searchParams.get('model') || '';
    const minPrice = searchParams.get('minPrice') || 0;
    const maxPrice = searchParams.get('maxPrice') || Number.MAX_SAFE_INTEGER;
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) query.category = { $regex: category, $options: 'i' };
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (model) query.model = { $regex: model, $options: 'i' };
    query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    
    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'price-low':
        sortQuery = { price: 1 };
        break;
      case 'price-high':
        sortQuery = { price: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortQuery).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);
    
    return Response.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Products fetch error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const productData = await request.json();
    const product = await Product.create(productData);
    
    return Response.json(product, { status: 201 });
    
  } catch (error) {
    console.error('Product creation error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}