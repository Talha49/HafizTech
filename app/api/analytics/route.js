import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
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
    
    // Get current date and calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Parse query params for filters and pagination/sorting
    const { searchParams } = new URL(request.url);
    const groupBy = (searchParams.get('groupBy') || 'month').toLowerCase(); // day|week|month|year
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const topPage = parseInt(searchParams.get('topPage') || '1');
    const topLimit = parseInt(searchParams.get('topLimit') || '10');
    const topSort = (searchParams.get('topSort') || 'totalSold'); // 'totalSold' | 'revenue'
    const topOrder = (searchParams.get('topOrder') || 'desc').toLowerCase() === 'asc' ? 1 : -1; // 1 | -1

    // Compute date range for charts and aggregations
    const startOfWeek = () => {
      const d = new Date(now);
      const day = d.getDay(); // 0..6 (Sun..Sat)
      const diff = (day === 0 ? 6 : day - 1); // Monday as start
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    const endOfWeek = () => {
      const s = startOfWeek();
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      e.setHours(23, 59, 59, 999);
      return e;
    };

    const parseDateOrNull = (v) => (v ? new Date(v) : null);
    let fromDate = parseDateOrNull(fromParam);
    let toDate = parseDateOrNull(toParam);
    if (!fromDate || !toDate) {
      if (groupBy === 'day') {
        const d = new Date(now);
        d.setDate(now.getDate() - 6);
        d.setHours(0, 0, 0, 0);
        fromDate = d;
        const t = new Date(now);
        t.setHours(23, 59, 59, 999);
        toDate = t;
      } else if (groupBy === 'week') {
        const d = startOfWeek();
        d.setDate(d.getDate() - 7 * 11); // last 12 weeks
        fromDate = d;
        toDate = endOfWeek();
      } else if (groupBy === 'year') {
        const y = now.getFullYear();
        fromDate = new Date(y - 4, 0, 1);
        toDate = new Date(y, 11, 31, 23, 59, 59, 999);
      } else {
        // month default: YTD
        fromDate = new Date(now.getFullYear(), 0, 1);
        toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      }
    }
    const dateMatch = { createdAt: { $gte: fromDate, $lte: toDate } };
    
    // Basic stats
    const [totalUsers, totalProducts, totalOrders, monthlyOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);
    
    // Revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);
    
    // Build series by chosen grouping
    const makeGroupId = (field) => {
      if (groupBy === 'day') return { y: { $year: field }, m: { $month: field }, d: { $dayOfMonth: field } };
      if (groupBy === 'week') return { y: { $isoWeekYear: field }, w: { $isoWeek: field } };
      if (groupBy === 'year') return { y: { $year: field } };
      return { y: { $year: field }, m: { $month: field } }; // month
    };

    const revenueAgg = await Order.aggregate([
      { $match: { ...dateMatch, status: { $ne: 'Cancelled' } } },
      { $group: { _id: makeGroupId('$createdAt'), revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.w': 1 } },
    ]);

    const usersAgg = await User.aggregate([
      { $match: dateMatch },
      { $group: { _id: makeGroupId('$createdAt'), users: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.w': 1 } },
    ]);

    const productsAgg = await Product.aggregate([
      { $match: dateMatch },
      { $group: { _id: makeGroupId('$createdAt'), products: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.w': 1 } },
    ]);

    const formatLabel = (id) => {
      if (id.d != null) {
        const mm = String(id.m).padStart(2, '0');
        const dd = String(id.d).padStart(2, '0');
        return `${id.y}-${mm}-${dd}`;
      }
      if (id.w != null) return `${id.y}-W${String(id.w).padStart(2, '0')}`;
      if (id.m != null) return `${id.y}-${String(id.m).padStart(2, '0')}`;
      return `${id.y}`;
    };

    const revenueSeries = revenueAgg.map((r) => ({ label: formatLabel(r._id), revenue: r.revenue, orders: r.orders }));
    const usersSeries = usersAgg.map((r) => ({ label: formatLabel(r._id), users: r.users }));
    const productsSeries = productsAgg.map((r) => ({ label: formatLabel(r._id), products: r.products }));
    
    // Top products with pagination and sorting (within date range)
    const baseGroupPipeline = [
      { $match: dateMatch },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
    ];

    const sortStage = { $sort: { [topSort]: topOrder } };
    const skip = (topPage - 1) * topLimit;

    const [topProducts, totalTopProductsCountAgg] = await Promise.all([
      Order.aggregate([
        ...baseGroupPipeline,
        sortStage,
        { $skip: skip },
        { $limit: topLimit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
      ]),
      Order.aggregate([...baseGroupPipeline, { $count: 'count' }]),
    ]);
    const totalTopProducts = totalTopProductsCountAgg?.[0]?.count || 0;
    
    // Order status distribution (within date range)
    const orderStatusStats = await Order.aggregate([
      { $match: dateMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    
    // Low stock products
    const lowStockProducts = await Product.find({ quantity: { $lte: 5 } })
      .select('title quantity')
      .limit(10);
    
    return Response.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        monthlyOrders,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        avgOrderValue: revenueStats[0]?.avgOrderValue || 0,
      },
      filters: {
        groupBy,
        from: fromDate,
        to: toDate,
      },
      revenueSeries,
      usersSeries,
      productsSeries,
      topProducts,
      topProductsPagination: {
        page: topPage,
        limit: topLimit,
        total: totalTopProducts,
        pages: Math.ceil(totalTopProducts / topLimit) || 1,
        sort: topSort,
        order: topOrder === 1 ? 'asc' : 'desc',
      },
      orderStatusStats,
      lowStockProducts,
    });
    
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}