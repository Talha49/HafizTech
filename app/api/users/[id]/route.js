import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function PUT(request, { params }) {
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
    
    // Allow users to update their own profile or admin to update any
    if (decoded.role !== 'admin' && decoded.userId !== params.id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const updateData = await request.json();
    delete updateData.password; // Don't allow password updates through this route
    
    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json(user);
    
  } catch (error) {
    console.error('User update error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
    
    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('User deletion error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}