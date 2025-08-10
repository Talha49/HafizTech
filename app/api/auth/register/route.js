import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { name, email, password, contact, address } = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      contact,
      address,
    });
    
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
      status: 201,
      headers: {
        'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`,
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}