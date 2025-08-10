// 'use client' not needed; functions are called client-side from components

export async function exportDashboardPDF({ analytics, chartRefs, siteName = 'Admin' }) {
  const { default: jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let cursorY = 20;

  const addHeader = () => {
    doc.setFontSize(14);
    doc.text(`${siteName} — Sales Report`, 14, 14);
    const range = `Group: ${analytics?.filters?.groupBy || 'month'}  From: ${analytics?.filters?.from ? new Date(analytics.filters.from).toLocaleDateString() : 'N/A'}  To: ${analytics?.filters?.to ? new Date(analytics.filters.to).toLocaleDateString() : 'N/A'}`;
    doc.setFontSize(10);
    doc.setTextColor('#555555');
    doc.text(range, 14, 19);
    doc.setTextColor('#000000');
    cursorY = 24;
  };

  const addFooter = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor('#777777');
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 8);
      doc.setTextColor('#000000');
    }
  };

  const ensureSpace = (blockHeight) => {
    if (cursorY + blockHeight > pageHeight - 20) {
      doc.addPage();
      addHeader();
    }
  };

  const addKpiRow = () => {
    doc.setFontSize(11);
    const kpis = [
      `Revenue: ₨${Number(analytics?.overview?.totalRevenue || 0).toLocaleString('en-PK')}`,
      `Orders: ${analytics?.overview?.totalOrders || 0}`,
      `Users: ${analytics?.overview?.totalUsers || 0}`,
      `Products: ${analytics?.overview?.totalProducts || 0}`,
    ];
    doc.text(kpis.join('   |   '), 14, cursorY);
    cursorY += 8;
  };

  const addChartImage = async (title, ref) => {
    if (!ref?.current) return;
    doc.setFontSize(12);
    doc.text(title, 14, cursorY);
    cursorY += 4;
    const canvas = await html2canvas(ref.current, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 28; // 14 margin both sides
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    ensureSpace(imgHeight + 8);
    doc.addImage(imgData, 'PNG', 14, cursorY, imgWidth, imgHeight);
    cursorY += imgHeight + 8;
  };

  const addTable = (title, headers, rows, columnWidths = []) => {
    doc.setFontSize(12);
    doc.text(title, 14, cursorY);
    cursorY += 4;
    const rowHeight = 7;
    const tableTop = cursorY;
    const startX = 14;
    const defaultWidths = columnWidths.length ? columnWidths : new Array(headers.length).fill((pageWidth - 28) / headers.length);

    // Header
    doc.setFillColor('#f3f4f6');
    doc.rect(startX, cursorY, defaultWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    doc.setFontSize(10);
    let x = startX;
    headers.forEach((h, idx) => {
      doc.text(String(h), x + 2, cursorY + 5);
      x += defaultWidths[idx];
    });
    cursorY += rowHeight;

    // Rows
    doc.setFontSize(10);
    rows.forEach((row) => {
      ensureSpace(rowHeight + 6);
      let colX = startX;
      row.forEach((cell, idx) => {
        doc.text(String(cell), colX + 2, cursorY + 5);
        colX += defaultWidths[idx];
      });
      // Row line
      doc.setDrawColor('#e5e7eb');
      doc.line(startX, cursorY + rowHeight, startX + defaultWidths.reduce((a, b) => a + b, 0), cursorY + rowHeight);
      cursorY += rowHeight;
    });

    // Outline
    const tableHeight = cursorY - tableTop;
    doc.setDrawColor('#e5e7eb');
    doc.rect(startX, tableTop, defaultWidths.reduce((a, b) => a + b, 0), tableHeight);
    cursorY += 6;
  };

  // Compose report
  addHeader();
  addKpiRow();

  // Charts: capture from refs
  await addChartImage('Revenue', chartRefs?.revenueRef);
  await addChartImage('New Users', chartRefs?.usersRef);
  await addChartImage('New Products', chartRefs?.productsRef);
  await addChartImage('Order Status', chartRefs?.statusRef);

  // Top products table
  const topRows = (analytics?.topProducts || []).map((tp, i) => [
    i + 1,
    tp.product?.title || 'Unknown',
    tp.totalSold,
    `₨${Number(tp.revenue || 0).toLocaleString('en-PK')}`,
  ]);
  addTable('Top Selling Products', ['#', 'Product', 'Sold', 'Revenue'], topRows, [10, 90, 25, 35]);

  // Low stock table
  const lowRows = (analytics?.lowStockProducts || []).map((lp) => [lp.title, lp.quantity]);
  addTable('Low Stock (≤5)', ['Product', 'Stock'], lowRows, [110, 50]);

  addFooter();
  doc.save('sales-report.pdf');
}

export async function exportDashboardExcel({ analytics }) {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  const addSheet = (name, data, cols) => {
    const ws = XLSX.utils.json_to_sheet(data);
    if (cols) ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  const overview = [
    { Metric: 'Group By', Value: analytics?.filters?.groupBy || 'month' },
    { Metric: 'From', Value: analytics?.filters?.from ? new Date(analytics.filters.from).toLocaleDateString() : 'N/A' },
    { Metric: 'To', Value: analytics?.filters?.to ? new Date(analytics.filters.to).toLocaleDateString() : 'N/A' },
    { Metric: 'Total Revenue (PKR)', Value: analytics?.overview?.totalRevenue || 0 },
    { Metric: 'Total Orders', Value: analytics?.overview?.totalOrders || 0 },
    { Metric: 'Total Users', Value: analytics?.overview?.totalUsers || 0 },
    { Metric: 'Total Products', Value: analytics?.overview?.totalProducts || 0 },
  ];

  addSheet('Overview', overview, [{ wch: 24 }, { wch: 30 }]);
  addSheet('Revenue', (analytics?.revenueSeries || []).map((r) => ({ Label: r.label, Revenue: r.revenue, Orders: r.orders })), [
    { wch: 18 }, { wch: 18 }, { wch: 12 },
  ]);
  addSheet('Users', (analytics?.usersSeries || []).map((u) => ({ Label: u.label, Users: u.users })), [
    { wch: 18 }, { wch: 12 },
  ]);
  addSheet('Products', (analytics?.productsSeries || []).map((p) => ({ Label: p.label, Products: p.products })), [
    { wch: 18 }, { wch: 12 },
  ]);
  addSheet('Top Products', (analytics?.topProducts || []).map((tp, i) => ({
    Rank: i + 1,
    Product: tp.product?.title || 'Unknown',
    Sold: tp.totalSold,
    Revenue: tp.revenue,
  })), [
    { wch: 8 }, { wch: 40 }, { wch: 10 }, { wch: 16 },
  ]);
  addSheet('Low Stock', (analytics?.lowStockProducts || []).map((lp) => ({ Product: lp.title, Stock: lp.quantity })), [
    { wch: 40 }, { wch: 10 },
  ]);
  addSheet('Order Status', (analytics?.orderStatusStats || []).map((st) => ({ Status: st._id, Count: st.count })), [
    { wch: 20 }, { wch: 10 },
  ]);

  XLSX.writeFile(wb, 'sales-report.xlsx');
}


