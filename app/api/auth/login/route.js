import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 400 });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return Response.json({ error: 'Invalid credentials' }, { status: 400 });
    }
    
    // Generate token
    const token = generateToken({ 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });
    
    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address,
      role: user.role,
    };
    
    return Response.json({
      user: userResponse,
      token,
    }, { 
      status: 200,
      headers: {
        'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`,
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}