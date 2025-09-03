import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request) {
  try {
    await connectDB();
    
    // Check admin authentication
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { updates } = await request.json();
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return Response.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Validate all updates before applying
    for (const update of updates) {
      if (!update._id) {
        return Response.json({ error: 'Product ID is required for all updates' }, { status: 400 });
      }
      
      if (update.discountPercentage < 0 || update.discountPercentage > 100) {
        return Response.json({ error: 'Discount percentage must be between 0 and 100' }, { status: 400 });
      }
    }

    // Apply bulk updates
    const updatePromises = updates.map(async (update) => {
      const { _id, ...updateData } = update;
      
      return Product.findByIdAndUpdate(
        _id,
        {
          $set: {
            originalPrice: updateData.originalPrice,
            discountPercentage: updateData.discountPercentage,
            price: updateData.price,
            isOnSale: updateData.isOnSale,
            saleEndDate: updateData.saleEndDate
          }
        },
        { new: true }
      );
    });

    const updatedProducts = await Promise.all(updatePromises);
    
    // Filter out any null results (products that weren't found)
    const successfulUpdates = updatedProducts.filter(product => product !== null);
    
    if (successfulUpdates.length === 0) {
      return Response.json({ error: 'No products were updated' }, { status: 400 });
    }

    return Response.json({
      message: `Successfully updated ${successfulUpdates.length} products`,
      updatedCount: successfulUpdates.length,
      totalRequested: updates.length
    });
    
  } catch (error) {
    console.error('Bulk discount error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}