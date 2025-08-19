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

    // Fetch order with populated product details for email
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'title images price')
      .populate('user', 'name email');

    // Prepare items array for email
    const emailItems = populatedOrder.items.map(item => ({
      title: item.product.title,
      image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : '',
      quantity: item.quantity,
      price: item.price,
    }));

    // Send confirmation email to user
    try {
      await sendOrderConfirmationEmail(decoded.email, {
        id: populatedOrder._id,
        totalAmount: populatedOrder.totalAmount,
        status: populatedOrder.status,
        items: emailItems,
        shippingAddress: populatedOrder.shippingAddress,
        user: { name: populatedOrder.user?.name || '' },
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    // Send notification email to admin
    try {
      const { sendAdminNewOrderEmail } = await import('@/lib/email');
      await sendAdminNewOrderEmail(process.env.MAIL_USER, {
        id: populatedOrder._id,
        totalAmount: populatedOrder.totalAmount,
        status: populatedOrder.status,
        items: emailItems,
        shippingAddress: populatedOrder.shippingAddress,
        user: {
          name: populatedOrder.user?.name || '',
          email: populatedOrder.user?.email || '',
        },
      });
    } catch (adminEmailError) {
      console.error('Admin order notification email error:', adminEmailError);
    }

    return Response.json(order, { status: 201 });
    
  } catch (error) {
    console.error('Order creation error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}