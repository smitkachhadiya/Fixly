const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const ServiceCategory = require('../models/ServiceCategory');
const ServiceListing = require('../models/ServiceListing');
const asyncHandler = require('../utils/asyncHandler');

// Helper function to generate date ranges based on time frame
const generateDateRanges = (timeFrame, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let dateRanges = [];
  
  switch (timeFrame) {
    case 'daily':
      // Generate daily ranges
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateCopy = new Date(d);
        dateRanges.push({
          label: dateCopy.toISOString().split('T')[0],
          start: new Date(dateCopy),
          end: new Date(dateCopy.setHours(23, 59, 59, 999))
        });
      }
      break;
      
    case 'weekly':
      // Generate weekly ranges
      let current = new Date(start);
      let weekNumber = 1;
      while (current <= end) {
        const weekStart = new Date(current);
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        // Ensure weekEnd doesn't exceed the overall end date
        if (weekEnd > end) {
          weekEnd.setTime(end.getTime());
        }
        
        dateRanges.push({
          label: `Week ${weekNumber}`,
          start: new Date(weekStart),
          end: new Date(weekEnd)
        });
        
        current.setDate(current.getDate() + 7);
        weekNumber++;
      }
      break;
      
    case 'monthly':
      // Generate monthly ranges
      let currentMonth = new Date(start);
      while (currentMonth <= end) {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        // Ensure monthEnd doesn't exceed the overall end date
        if (monthEnd > end) {
          monthEnd.setTime(end.getTime());
        }
        
        dateRanges.push({
          label: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
          start: new Date(monthStart),
          end: new Date(monthEnd)
        });
        
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      break;
      
    case 'yearly':
      // Generate yearly ranges
      let currentYear = new Date(start);
      while (currentYear <= end) {
        const yearStart = new Date(currentYear.getFullYear(), 0, 1);
        const yearEnd = new Date(currentYear.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        
        // Ensure yearEnd doesn't exceed the overall end date
        if (yearEnd > end) {
          yearEnd.setTime(end.getTime());
        }
        
        dateRanges.push({
          label: currentYear.getFullYear().toString(),
          start: new Date(yearStart),
          end: new Date(yearEnd)
        });
        
        currentYear.setFullYear(currentYear.getFullYear() + 1);
      }
      break;
      
    default:
      dateRanges = [{ label: 'Total', start: new Date(start), end: new Date(end) }];
  }
  
  return dateRanges;
};

// Helper function to format chart data
const formatChartData = (labels, datasets) => {
  return {
    labels,
    datasets: datasets.map((dataset, index) => {
      const colors = [
        'rgba(54, 162, 235, 1)',  // Blue
        'rgba(255, 99, 132, 1)',  // Red
        'rgba(75, 192, 192, 1)',  // Green
        'rgba(153, 102, 255, 1)', // Purple
        'rgba(255, 159, 64, 1)',  // Orange
        'rgba(255, 205, 86, 1)'   // Yellow
      ];
      
      return {
        label: dataset.label,
        data: dataset.data,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 1
      };
    })
  };
};

// @desc    Get revenue report data
// @route   GET /api/reports/revenue
// @access  Private (Admin only)
exports.getRevenueReport = asyncHandler(async (req, res) => {
  console.log('Revenue report request received:', req.query);
  console.log('User:', req.user);
  
  const { timeFrame, startDate, endDate } = req.query;
  
  // Validate required parameters
  if (!timeFrame || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide timeFrame, startDate, and endDate parameters'
    });
  }
  
  const dateRanges = generateDateRanges(timeFrame, startDate, endDate);
  
  // Get all payments in the time frame with status 'Completed'
  const payments = await Payment.find({
    paymentDateTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
    paymentStatus: 'Completed'
  });
  
  // Calculate revenue and commission for each date range
  const revenueData = [];
  const commissionData = [];
  
  for (const range of dateRanges) {
    const rangePayments = payments.filter(payment => 
      payment.paymentDateTime >= range.start && payment.paymentDateTime <= range.end
    );
    
    const revenue = rangePayments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
    const commission = rangePayments.reduce((sum, payment) => sum + payment.commissionAmount, 0);
    
    revenueData.push(revenue);
    commissionData.push(commission);
  }
  
  // Format chart data
  const chartData = formatChartData(
    dateRanges.map(range => range.label),
    [
      { label: 'Revenue', data: revenueData },
      { label: 'Commission', data: commissionData }
    ]
  );
  
  // Summary data
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
  const totalCommission = payments.reduce((sum, payment) => sum + payment.commissionAmount, 0);
  const totalPayments = payments.length;
  
  const summary = {
    totalRevenue,
    totalCommission,
    totalPayments,
    averageRevenue: totalPayments > 0 ? totalRevenue / totalPayments : 0
  };
  
  res.status(200).json({
    success: true,
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
      summary,
      tableHeaders: ['Period', 'Revenue', 'Commission', 'Payments'],
      tableData: dateRanges.map((range, index) => ({
        period: range.label,
        revenue: revenueData[index],
        commission: commissionData[index],
        payments: payments.filter(p => 
          p.paymentDateTime >= range.start && p.paymentDateTime <= range.end
        ).length
      }))
    }
  });
});

// @desc    Get bookings report data
// @route   GET /api/reports/bookings
// @access  Private (Admin only)
exports.getBookingsReport = asyncHandler(async (req, res) => {
  console.log('Bookings report request received:', req.query);
  console.log('User:', req.user);
  
  const { timeFrame, startDate, endDate } = req.query;
  
  // Validate required parameters
  if (!timeFrame || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide timeFrame, startDate, and endDate parameters'
    });
  }
  
  const dateRanges = generateDateRanges(timeFrame, startDate, endDate);
  
  // Get all bookings in the time frame
  const bookings = await Booking.find({
    bookingDateTime: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });
  
  // Calculate bookings for each date range
  const bookingData = [];
  const completedData = [];
  const cancelledData = [];
  
  for (const range of dateRanges) {
    const rangeBookings = bookings.filter(booking => 
      booking.bookingDateTime >= range.start && booking.bookingDateTime <= range.end
    );
    
    const completedBookings = rangeBookings.filter(b => b.bookingStatus === 'Completed');
    const cancelledBookings = rangeBookings.filter(b => b.bookingStatus === 'Cancelled');
    
    bookingData.push(rangeBookings.length);
    completedData.push(completedBookings.length);
    cancelledData.push(cancelledBookings.length);
  }
  
  // Format chart data
  const chartData = formatChartData(
    dateRanges.map(range => range.label),
    [
      { label: 'Total Bookings', data: bookingData },
      { label: 'Completed', data: completedData },
      { label: 'Cancelled', data: cancelledData }
    ]
  );
  
  // Summary data
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.bookingStatus === 'Completed').length;
  const cancelledBookings = bookings.filter(b => b.bookingStatus === 'Cancelled').length;
  const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
  
  const summary = {
    totalBookings,
    completedBookings,
    cancelledBookings,
    completionRate: completionRate.toFixed(2) + '%'
  };
  
  res.status(200).json({
    success: true,
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
      summary,
      tableHeaders: ['Period', 'Total Bookings', 'Completed', 'Cancelled'],
      tableData: dateRanges.map((range, index) => ({
        period: range.label,
        totalBookings: bookingData[index],
        completed: completedData[index],
        cancelled: cancelledData[index]
      }))
    }
  });
});

// @desc    Get user growth report data
// @route   GET /api/reports/users
// @access  Private (Admin only)
exports.getUsersReport = asyncHandler(async (req, res) => {
  console.log('Users report request received:', req.query);
  console.log('User:', req.user);
  
  const { timeFrame, startDate, endDate } = req.query;
  
  // Validate required parameters
  if (!timeFrame || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide timeFrame, startDate, and endDate parameters'
    });
  }
  
  const dateRanges = generateDateRanges(timeFrame, startDate, endDate);
  
  // Get all users created in the time frame
  const users = await User.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });
  
  // Calculate user growth for each date range
  const userData = [];
  
  for (const range of dateRanges) {
    const rangeUsers = users.filter(user => 
      user.createdAt >= range.start && user.createdAt <= range.end
    );
    
    userData.push(rangeUsers.length);
  }
  
  // Format chart data
  const chartData = formatChartData(
    dateRanges.map(range => range.label),
    [
      { label: 'New Users', data: userData }
    ]
  );
  
  // Summary data
  const totalUsers = users.length;
  const averageGrowth = dateRanges.length > 0 ? (totalUsers / dateRanges.length).toFixed(2) : 0;
  
  const summary = {
    totalNewUsers: totalUsers,
    averageGrowthPerPeriod: averageGrowth,
    dateRange: `${startDate} to ${endDate}`
  };
  
  res.status(200).json({
    success: true,
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
      summary,
      tableHeaders: ['Period', 'New Users'],
      tableData: dateRanges.map((range, index) => ({
        period: range.label,
        newUsers: userData[index]
      }))
    }
  });
});

// @desc    Get provider growth report data
// @route   GET /api/reports/providers
// @access  Private (Admin only)
exports.getProvidersReport = asyncHandler(async (req, res) => {
  console.log('Providers report request received:', req.query);
  console.log('User:', req.user);
  
  const { timeFrame, startDate, endDate } = req.query;
  
  // Validate required parameters
  if (!timeFrame || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Please provide timeFrame, startDate, and endDate parameters'
    });
  }
  
  const dateRanges = generateDateRanges(timeFrame, startDate, endDate);
  
  // Get all providers created in the time frame
  const providers = await ServiceProvider.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).populate({
    path: 'userId',
    select: 'firstName lastName'
  });
  
  // Calculate provider growth for each date range
  const providerData = [];
  
  for (const range of dateRanges) {
    const rangeProviders = providers.filter(provider => 
      provider.createdAt >= range.start && provider.createdAt <= range.end
    );
    
    providerData.push(rangeProviders.length);
  }
  
  // Format chart data
  const chartData = formatChartData(
    dateRanges.map(range => range.label),
    [
      { label: 'New Providers', data: providerData }
    ]
  );
  
  // Summary data
  const totalProviders = providers.length;
  const averageGrowth = dateRanges.length > 0 ? (totalProviders / dateRanges.length).toFixed(2) : 0;
  
  const summary = {
    totalNewProviders: totalProviders,
    averageGrowthPerPeriod: averageGrowth,
    dateRange: `${startDate} to ${endDate}`
  };
  
  res.status(200).json({
    success: true,
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
      summary,
      tableHeaders: ['Period', 'New Providers'],
      tableData: dateRanges.map((range, index) => ({
        period: range.label,
        newProviders: providerData[index]
      }))
    }
  });
});

// @desc    Get category distribution report data
// @route   GET /api/reports/categories
// @access  Private (Admin only)
exports.getCategoriesReport = asyncHandler(async (req, res) => {
  console.log('Categories report request received:', req.query);
  console.log('User:', req.user);
  
  // Get all categories with their listing counts
  const categories = await ServiceCategory.find().populate({
    path: 'serviceListings',
    model: 'ServiceListing'
  });
  
  // Calculate listing counts for each category
  const categoryData = categories.map(category => ({
    name: category.categoryName,
    count: category.serviceListings.length
  }));
  
  // Filter out categories with zero listings
  const filteredData = categoryData.filter(item => item.count > 0);
  
  // Sort by count descending
  filteredData.sort((a, b) => b.count - a.count);
  
  // Format chart data
  const chartData = formatChartData(
    filteredData.map(item => item.name),
    [
      { label: 'Listings', data: filteredData.map(item => item.count) }
    ]
  );
  
  // Summary data
  const totalCategories = categories.length;
  const totalListings = filteredData.reduce((sum, item) => sum + item.count, 0);
  const averageListingsPerCategory = totalCategories > 0 ? (totalListings / totalCategories).toFixed(2) : 0;
  
  const summary = {
    totalCategories,
    totalListings,
    averageListingsPerCategory
  };
  
  res.status(200).json({
    success: true,
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
      summary,
      tableHeaders: ['Category', 'Listings'],
      tableData: filteredData
    }
  });
});

// @desc    Get services distribution report data
// @route   GET /api/reports/services
// @access  Private (Admin only)
exports.getServicesReport = asyncHandler(async (req, res) => {
  console.log('Services report request received:', req.query);
  console.log('User:', req.user);
  
  // Get all service listings with their category info
  const services = await ServiceListing.find().populate({
    path: 'categoryId',
    select: 'categoryName'
  });
  
  // Group services by category
  const categoryMap = {};
  
  services.forEach(service => {
    const categoryName = service.categoryId ? service.categoryId.categoryName : 'Uncategorized';
    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = 0;
    }
    categoryMap[categoryName]++;
  });
  
  // Convert to array and sort
  const serviceData = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  // Format chart data
  const chartData = formatChartData(
    serviceData.map(item => item.name),
    [
      { label: 'Services', data: serviceData.map(item => item.count) }
    ]
  );
  
  // Summary data
  const totalServices = services.length;
  const totalCategories = Object.keys(categoryMap).length;
  
  const summary = {
    totalServices,
    totalCategories,
    mostPopularCategory: serviceData.length > 0 ? serviceData[0].name : 'None'
  };
  
  res.status(200).json({
    success: true,
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
      summary,
      tableHeaders: ['Category', 'Services'],
      tableData: serviceData
    }
  });
});