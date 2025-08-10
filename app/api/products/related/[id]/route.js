import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const product = await Product.findById(params.id);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const relatedProducts = await Product.find({
      category: { $regex: product.category, $options: 'i' },
      _id: { $ne: new mongoose.Types.ObjectId(params.id) },
    })
      .limit(4)
      .sort({ createdAt: -1 }); // Sort by newest, consistent with default in GET API

    return Response.json({
      products: relatedProducts,
    });
  } catch (error) {
    console.error('Related products fetch error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}