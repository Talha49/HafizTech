import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const product = await Product.findById(params.id);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return Response.json(product);
    
  } catch (error) {
    console.error('Product fetch error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    const product = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );
    
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return Response.json(product);
    
  } catch (error) {
    console.error('Product update error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const product = await Product.findByIdAndDelete(params.id);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return Response.json({ message: 'Product deleted successfully' });
    
  } catch (error) {
    console.error('Product deletion error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}