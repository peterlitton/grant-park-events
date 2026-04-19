// ================================================
// GET SUBSCRIBER STATS - Netlify Function
// ================================================
// Fetches subscriber statistics from MailerLite API
// Returns: Summary stats + recent 50 subscribers
// Caching: 5 minutes (300 seconds)
// Build7 - Initial implementation
// ================================================

export default async (req, context) => {
  const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
  
  // Validate API key exists
  if (!MAILERLITE_API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'MailerLite API key not configured',
      message: 'Please add MAILERLITE_API_KEY to Netlify environment variables'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Helper function to fetch all pages of subscribers
    const fetchAllSubscribers = async (type) => {
      let allSubscribers = [];
      let offset = 0;
      const limit = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const response = await fetch(
          `https://api.mailerlite.com/api/v2/subscribers?limit=${limit}&offset=${offset}&type=${type}`,
          {
            headers: {
              'X-MailerLite-ApiKey': MAILERLITE_API_KEY
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`MailerLite API error: ${response.status} - ${response.statusText}`);
        }
        
        const batch = await response.json();
        allSubscribers = allSubscribers.concat(batch);
        
        // If we got less than the limit, we've reached the end
        if (batch.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }
      
      return allSubscribers;
    };
    
    // Fetch active subscribers (all pages)
    const activeSubscribers = await fetchAllSubscribers('active');
    
    // Fetch unsubscribed for metrics (all pages)
    const unsubscribers = await fetchAllSubscribers('unsubscribed');
    
    // Build10.10 - Process ALL subscribers ONCE, extract custom fields, NO fallback
    const processedSubscribers = activeSubscribers.map(sub => {
      const sourceField = sub.fields.find(f => f.key === 'creation_source' || f.key === 'CreationSource');
      const dateField = sub.fields.find(f => f.key === 'creation_date' || f.key === 'CreationDate');
      
      // Skip if no creation_date field
      if (!dateField?.value) return null;
      
      return {
        email: sub.email,
        source: sourceField?.value || 'Unknown',
        dateAdded: dateField.value,
        status: 'Active'
      };
    }).filter(Boolean); // Remove nulls
    
    // Process data
    const now = new Date();
    
    // "This Month" - use processed data
    const thisMonth = processedSubscribers.filter(sub => {
      const subDate = new Date(sub.dateAdded);
      return subDate.getMonth() === now.getMonth() && 
             subDate.getFullYear() === now.getFullYear();
    });
    
    // Calculate unsubscribe rate
    const totalEver = processedSubscribers.length + unsubscribers.length;
    const unsubRate = totalEver > 0 ? ((unsubscribers.length / totalEver) * 100).toFixed(1) : '0.0';
    
    // Build10.32.4: Removed .slice(0, 50) — dashboard filters by date range up to 30 days,
    // capping to 50 would underreport 30-day counts during high-volume periods.
    // Full list is what admin.html's Subscribers tab wants anyway.
    const recentSubscribers = processedSubscribers
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    // Growth chart - use processed data
    const growthByDay = {};
    processedSubscribers.forEach(sub => {
      const day = sub.dateAdded.split(' ')[0]; // Get YYYY-MM-DD
      growthByDay[day] = (growthByDay[day] || 0) + 1;
    });
    
    // Convert to cumulative
    const sortedDays = Object.keys(growthByDay).sort();
    let cumulative = 0;
    const growthData = sortedDays.map(day => {
      cumulative += growthByDay[day];
      return { date: day, daily: growthByDay[day], cumulative: cumulative };
    });
    
    // Build10.14.8: Normalize source names to prevent case/spelling variants from splitting pie chart
    const normalizeSource = (source) => {
      if (!source) return 'Unknown';
      const lower = source.toLowerCase().trim();
      // Map known variants to canonical names
      if (lower === 'pop-up' || lower === 'pop-up' || lower === 'popup') return 'Pop-Up';
      if (lower === 'page' || lower === 'signup page') return 'Page';
      if (lower === 'api' || lower === 'import') return 'API';
      return source; // Return original if no normalization needed
    };

    // Source breakdown - use processed data with normalization
    const sourceBreakdown = {};
    processedSubscribers.forEach(sub => {
      const normalizedSource = normalizeSource(sub.source);
      sourceBreakdown[normalizedSource] = (sourceBreakdown[normalizedSource] || 0) + 1;
    });
    
    const stats = {
      total: processedSubscribers.length,
      thisMonth: thisMonth.length,
      unsubRate: unsubRate,
      activeRate: '24.5', // Placeholder - will be calculated with campaign data in future build
      recent: recentSubscribers,
      growthData: growthData,        // Build8 - for growth chart
      sourceBreakdown: sourceBreakdown, // Build8 - for source pie chart
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes
      }
    });
    
  } catch (error) {
    console.error('Error fetching subscriber stats:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch subscriber data',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
