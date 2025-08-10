import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    let query = {};
    if (decoded.role !== 'admin') {
      query.user = decoded.userId;
    }
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'title images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);
    
    return Response.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Orders fetch error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { items, shippingAddress } = await request.json();
    
    // Calculate total and update inventory
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) {
        return Response.json({ error: `Product ${item.title} not found` }, { status: 400 });
      }
      
      if (product.quantity < item.quantity) {
        return Response.json({ error: `Insufficient stock for ${product.title}` }, { status: 400 });
      }
      
      // Update product quantity
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { quantity: -item.quantity } }
      );
      
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }
    
    // Create order
    const order = await Order.create({
      user: decoded.userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });
    
    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(decoded.email, {
        id: order._id,
        totalAmount,
        status: order.status,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }
    
    return Response.json(order, { status: 201 });
    
  } catch (error) {
    console.error('Order creation error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}