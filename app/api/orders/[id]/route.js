import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { status } = await request.json();

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).populate('user', 'name email').populate('items.product', 'title images price');

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Send status update email to user (custom template)
    try {
      const emailItems = order.items.map(item => ({
        title: item.product.title,
        image: Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : '',
        quantity: item.quantity,
        price: item.price,
      }));
      const { sendOrderStatusUpdateEmail } = await import('@/lib/email');
      await sendOrderStatusUpdateEmail(order.user.email, {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        items: emailItems,
        shippingAddress: order.shippingAddress,
        user: { name: order.user?.name || '' },
      });
    } catch (emailError) {
      console.error('Order status update email error:', emailError);
    }

    return Response.json(order);
    
  } catch (error) {
    console.error('Order update error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

