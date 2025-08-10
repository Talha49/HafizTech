// Enhanced Export Functions with Professional Formatting
// File: /lib/export/exportAnalytics.js

export async function exportDashboardPDF({ analytics, chartRefs, siteName = 'Hafiz Tech' }) {
  const { default: jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 0;

  // Professional color scheme
  const colors = {
    primary: '#2563eb',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    text: '#1e293b',
    textLight: '#64748b',
    border: '#e2e8f0',
    background: '#f8fafc'
  };

  // Helper functions
  const addNewPage = () => {
    doc.addPage();
    currentY = 0;
    addHeader();
    return 25; // Return new Y position after header
  };

  const checkPageSpace = (requiredSpace) => {
    if (currentY + requiredSpace > pageHeight - 25) {
      currentY = addNewPage();
    }
  };

  const addHeader = () => {
    // Company header with professional styling
    doc.setFillColor(colors.primary);
    doc.rect(0, 0, pageWidth, 20, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${siteName} - Analytics Report`, 15, 12);
    
    // Report date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth - 15, 12, { align: 'right' });
    
    // Report filters
    const filterInfo = [
      `Period: ${analytics?.filters?.groupBy || 'monthly'}`,
      analytics?.filters?.from ? `From: ${new Date(analytics.filters.from).toLocaleDateString('en-PK')}` : null,
      analytics?.filters?.to ? `To: ${new Date(analytics.filters.to).toLocaleDateString('en-PK')}` : null
    ].filter(Boolean).join(' | ');
    
    doc.setTextColor(colors.textLight);
    doc.setFontSize(8);
    doc.text(filterInfo, 15, 16);
    
    currentY = 25;
  };

  const addFooter = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(colors.border);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      // Page number and company info
      doc.setTextColor(colors.textLight);
      doc.setFontSize(8);
      doc.text(`${siteName} | Confidential Business Report`, 15, pageHeight - 8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
    }
  };

  const addSection = (title, content) => {
    checkPageSpace(20);
    
    // Section title with colored background
    doc.setFillColor(colors.background);
    doc.rect(15, currentY, pageWidth - 30, 8, 'F');
    
    doc.setTextColor(colors.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 17, currentY + 5.5);
    
    currentY += 12;
    
    if (typeof content === 'function') {
      content();
    }
  };

  const addKPICards = () => {
    const kpis = [
      {
        label: 'Total Revenue',
        value: `₨${Number(analytics?.overview?.totalRevenue || 0).toLocaleString('en-PK')}`,
        color: colors.success
      },
      {
        label: 'Total Orders',
        value: Number(analytics?.overview?.totalOrders || 0).toLocaleString(),
        color: colors.primary
      },
      {
        label: 'Total Users',
        value: Number(analytics?.overview?.totalUsers || 0).toLocaleString(),
        color: colors.warning
      },
      {
        label: 'Total Products',
        value: Number(analytics?.overview?.totalProducts || 0).toLocaleString(),
        color: colors.danger
      }
    ];

    const cardWidth = (pageWidth - 45) / 4; // 15 margin + 15 spacing
    const cardHeight = 20;
    
    checkPageSpace(cardHeight + 5);

    kpis.forEach((kpi, index) => {
      const x = 15 + (index * (cardWidth + 3.75));
      
      // Card background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(colors.border);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');
      
      // Value
      doc.setTextColor(kpi.color);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(kpi.value, x + cardWidth/2, currentY + 8, { align: 'center' });
      
      // Label
      doc.setTextColor(colors.textLight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(kpi.label, x + cardWidth/2, currentY + 15, { align: 'center' });
    });

    currentY += cardHeight + 10;
  };

  const addChart = async (title, ref, height = 60) => {
    if (!ref?.current) return;
    
    checkPageSpace(height + 15);
    
    // Chart title
    doc.setTextColor(colors.text);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, currentY);
    currentY += 8;
    
    try {
      const canvas = await html2canvas(ref.current, { 
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const finalHeight = Math.min(imgHeight, height);
      
      checkPageSpace(finalHeight + 5);
      
      // Chart border
      doc.setDrawColor(colors.border);
      doc.rect(15, currentY, imgWidth, finalHeight);
      
      doc.addImage(imgData, 'PNG', 15, currentY, imgWidth, finalHeight);
      currentY += finalHeight + 10;
    } catch (error) {
      console.error(`Error adding chart ${title}:`, error);
      doc.setTextColor(colors.textLight);
      doc.setFontSize(10);
      doc.text(`Chart could not be generated: ${title}`, 15, currentY + 20);
      currentY += 30;
    }
  };

  const addTable = (title, headers, rows, columnWidths = []) => {
    if (!rows.length) return;
    
    const defaultWidths = columnWidths.length ? 
      columnWidths : 
      new Array(headers.length).fill((pageWidth - 30) / headers.length);
    
    const rowHeight = 8;
    const tableWidth = defaultWidths.reduce((sum, width) => sum + width, 0);
    
    checkPageSpace((rows.length + 3) * rowHeight + 15);
    
    // Table title
    doc.setTextColor(colors.text);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, currentY);
    currentY += 8;
    
    // Table header
    doc.setFillColor(colors.primary);
    doc.rect(15, currentY, tableWidth, rowHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    let x = 15;
    headers.forEach((header, i) => {
      doc.text(String(header), x + 3, currentY + 5.5);
      x += defaultWidths[i];
    });
    currentY += rowHeight;
    
    // Table rows
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');
    
    rows.forEach((row, rowIndex) => {
      checkPageSpace(rowHeight + 5);
      
      // Alternating row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(colors.background);
        doc.rect(15, currentY, tableWidth, rowHeight, 'F');
      }
      
      let cellX = 15;
      row.forEach((cell, cellIndex) => {
        const cellValue = String(cell || '');
        const maxWidth = defaultWidths[cellIndex] - 6;
        
        // Truncate long text
        let displayText = cellValue;
        if (doc.getTextWidth(displayText) > maxWidth) {
          while (doc.getTextWidth(displayText + '...') > maxWidth && displayText.length > 1) {
            displayText = displayText.slice(0, -1);
          }
          displayText += '...';
        }
        
        doc.text(displayText, cellX + 3, currentY + 5.5);
        cellX += defaultWidths[cellIndex];
      });
      
      currentY += rowHeight;
    });
    
    // Table border
    doc.setDrawColor(colors.border);
    doc.rect(15, currentY - (rows.length + 1) * rowHeight, tableWidth, (rows.length + 1) * rowHeight);
    
    currentY += 10;
  };

  // Generate PDF content
  addHeader();
  
  // Executive Summary
  addSection('Executive Summary', addKPICards);
  
  // Charts Section
  addSection('Performance Charts', () => {});
  await addChart('Revenue Trends', chartRefs?.revenueRef);
  await addChart('User Growth', chartRefs?.usersRef);
  await addChart('Product Performance', chartRefs?.productsRef);
  await addChart('Order Status Distribution', chartRefs?.statusRef);
  
  // Top Products Table
  const topProductsRows = (analytics?.topProducts || []).map((product, index) => [
    index + 1,
    product.product?.title || 'Unknown Product',
    Number(product.totalSold || 0).toLocaleString(),
    `₨${Number(product.revenue || 0).toLocaleString('en-PK')}`
  ]);
  
  addSection('Top Performing Products', () => {
    addTable(
      'Best Sellers by Revenue',
      ['Rank', 'Product Name', 'Units Sold', 'Revenue'],
      topProductsRows,
      [15, 85, 25, 35]
    );
  });
  
  // Low Stock Alert
  if (analytics?.lowStockProducts?.length > 0) {
    const lowStockRows = analytics.lowStockProducts.map(product => [
      product.title || 'Unknown Product',
      product.quantity || 0,
      product.quantity <= 2 ? 'Critical' : 'Low'
    ]);
    
    addSection('Inventory Alerts', () => {
      addTable(
        'Low Stock Items (≤5 units)',
        ['Product Name', 'Current Stock', 'Status'],
        lowStockRows,
        [90, 20, 25]
      );
    });
  }
  
  // Order Status Summary
  if (analytics?.orderStatusStats?.length > 0) {
    const statusRows = analytics.orderStatusStats.map(status => [
      status._id || 'Unknown',
      Number(status.count || 0).toLocaleString(),
      `${((status.count / analytics.overview.totalOrders) * 100).toFixed(1)}%`
    ]);
    
    addSection('Order Analysis', () => {
      addTable(
        'Order Status Breakdown',
        ['Status', 'Count', 'Percentage'],
        statusRows,
        [50, 30, 25]
      );
    });
  }
  
  // Report Footer
  checkPageSpace(20);
  doc.setTextColor(colors.textLight);
  doc.setFontSize(8);
  doc.text('This report contains confidential business information. Distribution should be limited to authorized personnel only.', 15, currentY + 10);
  
  addFooter();
  doc.save(`${siteName}-Analytics-Report-${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function exportDashboardExcel({ analytics }) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Styling helpers
  const createStyledSheet = (data, sheetName, columnWidths = []) => {
    const ws = XLSX.utils.json_to_sheet(data);
    
    if (columnWidths.length) {
      ws['!cols'] = columnWidths.map(width => ({ wch: width }));
    }
    
    // Add some basic formatting
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Header styling
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2563eb" } },
          alignment: { horizontal: "center" }
        };
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  // Report Summary
  const summary = [
    { 'Report Information': 'Company', 'Value': 'Hafiz Tech' },
    { 'Report Information': 'Generated Date', 'Value': new Date().toLocaleDateString('en-PK') },
    { 'Report Information': 'Report Period', 'Value': analytics?.filters?.groupBy || 'Monthly' },
    { 'Report Information': 'Date From', 'Value': analytics?.filters?.from ? new Date(analytics.filters.from).toLocaleDateString('en-PK') : 'All Time' },
    { 'Report Information': 'Date To', 'Value': analytics?.filters?.to ? new Date(analytics.filters.to).toLocaleDateString('en-PK') : 'All Time' },
    { 'Report Information': '', 'Value': '' },
    { 'Report Information': 'KEY METRICS', 'Value': '' },
    { 'Report Information': 'Total Revenue (PKR)', 'Value': Number(analytics?.overview?.totalRevenue || 0).toLocaleString('en-PK') },
    { 'Report Information': 'Total Orders', 'Value': Number(analytics?.overview?.totalOrders || 0).toLocaleString() },
    { 'Report Information': 'Total Users', 'Value': Number(analytics?.overview?.totalUsers || 0).toLocaleString() },
    { 'Report Information': 'Total Products', 'Value': Number(analytics?.overview?.totalProducts || 0).toLocaleString() },
    { 'Report Information': 'Average Order Value', 'Value': analytics?.overview?.totalOrders > 0 ? `₨${Math.round((analytics.overview.totalRevenue || 0) / analytics.overview.totalOrders).toLocaleString('en-PK')}` : '₨0' }
  ];
  createStyledSheet(summary, 'Summary', [25, 25]);

  // Revenue Data
  const revenueData = (analytics?.revenueSeries || []).map(item => ({
    'Period': item.label,
    'Revenue (PKR)': Number(item.revenue || 0),
    'Orders': Number(item.orders || 0),
    'Avg Order Value': item.orders > 0 ? Math.round(item.revenue / item.orders) : 0
  }));
  createStyledSheet(revenueData, 'Revenue Trends', [18, 20, 12, 18]);

  // User Growth
  const userData = (analytics?.usersSeries || []).map(item => ({
    'Period': item.label,
    'New Users': Number(item.users || 0)
  }));
  createStyledSheet(userData, 'User Growth', [18, 15]);

  // Product Performance
  const productData = (analytics?.productsSeries || []).map(item => ({
    'Period': item.label,
    'New Products': Number(item.products || 0)
  }));
  createStyledSheet(productData, 'Product Growth', [18, 15]);

  // Top Products
  const topProducts = (analytics?.topProducts || []).map((product, index) => ({
    'Rank': index + 1,
    'Product Name': product.product?.title || 'Unknown Product',
    'Units Sold': Number(product.totalSold || 0),
    'Revenue (PKR)': Number(product.revenue || 0),
    'Avg Price': product.totalSold > 0 ? Math.round(product.revenue / product.totalSold) : 0
  }));
  createStyledSheet(topProducts, 'Top Products', [8, 45, 12, 18, 15]);

  // Order Status
  const orderStatus = (analytics?.orderStatusStats || []).map(status => ({
    'Order Status': status._id || 'Unknown',
    'Count': Number(status.count || 0),
    'Percentage': `${((status.count / (analytics?.overview?.totalOrders || 1)) * 100).toFixed(1)}%`
  }));
  createStyledSheet(orderStatus, 'Order Status', [20, 12, 12]);

  // Low Stock Items
  if (analytics?.lowStockProducts?.length > 0) {
    const lowStock = analytics.lowStockProducts.map(product => ({
      'Product Name': product.title || 'Unknown Product',
      'Current Stock': Number(product.quantity || 0),
      'Status': product.quantity <= 2 ? 'Critical' : 'Low',
      'Reorder Recommended': product.quantity <= 5 ? 'Yes' : 'No'
    }));
    createStyledSheet(lowStock, 'Low Stock Alert', [45, 15, 12, 18]);
  }

  // Detailed Analytics (if available)
  if (analytics?.detailedStats) {
    const detailed = Object.entries(analytics.detailedStats).map(([key, value]) => ({
      'Metric': key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      'Value': typeof value === 'number' ? value.toLocaleString() : String(value)
    }));
    createStyledSheet(detailed, 'Detailed Analytics', [30, 20]);
  }

  // Save the workbook
  const fileName = `Hafiz-Tech-Analytics-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}