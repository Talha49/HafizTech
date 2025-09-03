// Script to clean up orders with deleted product references
import connectDB from '../lib/mongodb.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

async function cleanupOrders() {
  await connectDB();
  
  const orders = await Order.find({}).populate('items.product');
  
  for (let order of orders) {
    let hasChanges = false;
    
    // Filter out items with null/deleted products
    const validItems = order.items.filter(item => {
      if (!item.product) {
        console.log(`Removing deleted product from order ${order._id}`);
        hasChanges = true;
        return false;
      }
      return true;
    });
    
    if (hasChanges) {
      order.items = validItems;
      
      // Recalculate total if needed
      order.totalAmount = validItems.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );
      
      await order.save();
      console.log(`Updated order ${order._id}`);
    }
  }
  
  console.log('Cleanup completed');
}

cleanupOrders().catch(console.error);