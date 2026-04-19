// Test MailerLite API connectivity
// Simple test to verify API key is valid and connection works

export default async (req, context) => {
  try {
    console.log('[TEST] Testing MailerLite API connectivity...');
    
    const MAILERLITE_API_KEY = Netlify.env.get('MAILERLITE_API_KEY');
    const MAILERLITE_GROUP_ID = Netlify.env.get('MAILERLITE_GROUP_ID');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    // Test 1: Check API Key is configured
    results.tests.push({
      name: 'API Key Configured',
      pass: !!MAILERLITE_API_KEY,
      message: MAILERLITE_API_KEY ? 'API key is set' : 'MAILERLITE_API_KEY not found in environment'
    });
    
    // Test 2: Check Group ID is configured
    results.tests.push({
      name: 'Group ID Configured',
      pass: !!MAILERLITE_GROUP_ID,
      message: MAILERLITE_GROUP_ID ? `Group ID: ${MAILERLITE_GROUP_ID}` : 'MAILERLITE_GROUP_ID not found in environment'
    });
    
    // Test 3: API Authentication
    if (MAILERLITE_API_KEY) {
      try {
        const authResponse = await fetch('https://connect.mailerlite.com/api/subscribers?limit=1', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'Accept': 'application/json'
          }
        });
        
        const authStatus = authResponse.status;
        const authOk = authResponse.ok;
        
        results.tests.push({
          name: 'API Authentication',
          pass: authOk,
          message: authOk ? 'Successfully authenticated with MailerLite' : `Auth failed with status ${authStatus}`
        });
        
        if (authOk) {
          const data = await authResponse.json();
          results.tests.push({
            name: 'API Response',
            pass: true,
            message: `API returned ${data.data?.length || 0} subscribers (limit 1 test)`
          });
        }
      } catch (authError) {
        results.tests.push({
          name: 'API Authentication',
          pass: false,
          message: `Auth error: ${authError.message}`
        });
      }
    }
    
    // Test 4: Group exists
    if (MAILERLITE_API_KEY && MAILERLITE_GROUP_ID) {
      try {
        const groupResponse = await fetch(`https://connect.mailerlite.com/api/groups/${MAILERLITE_GROUP_ID}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
            'Accept': 'application/json'
          }
        });
        
        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          results.tests.push({
            name: 'Group Exists',
            pass: true,
            message: `Group "${groupData.data?.name}" found with ${groupData.data?.active_count || 0} active subscribers`
          });
        } else {
          results.tests.push({
            name: 'Group Exists',
            pass: false,
            message: `Group not found (status ${groupResponse.status})`
          });
        }
      } catch (groupError) {
        results.tests.push({
          name: 'Group Exists',
          pass: false,
          message: `Group check error: ${groupError.message}`
        });
      }
    }
    
    // Calculate overall status
    const allPassed = results.tests.every(t => t.pass);
    results.overallStatus = allPassed ? 'PASS' : 'FAIL';
    results.passCount = results.tests.filter(t => t.pass).length;
    results.totalCount = results.tests.length;
    
    return new Response(JSON.stringify(results, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('[TEST] Error:', error);
    return new Response(JSON.stringify({
      overallStatus: 'ERROR',
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
