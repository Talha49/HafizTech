import connectDB from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await connectDB();
    
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    
    return Response.json(settings);
    
  } catch (error) {
    console.error('Site settings fetch error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    updateData.updatedAt = new Date();
    
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(updateData);
    } else {
      settings = await SiteSettings.findOneAndUpdate(
        {},
        updateData,
        { new: true }
      );
    }
    
    return Response.json(settings);
    
  } catch (error) {
    console.error('Site settings update error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}