// GSC Debug Function - Build10.13.1
// Diagnostic tool to troubleshoot gsc-index-status issues

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  // CHECK 1: Environment Variables
  diagnostics.checks.push({
    step: '1. Environment Variables',
    status: 'checking...'
  });

  const envVars = {
    GSC_PROJECT_ID: !!Netlify.env.get('GSC_PROJECT_ID'),
    GSC_PRIVATE_KEY_ID: !!Netlify.env.get('GSC_PRIVATE_KEY_ID'),
    GSC_PRIVATE_KEY: !!Netlify.env.get('GSC_PRIVATE_KEY'),
    GSC_CLIENT_EMAIL: !!Netlify.env.get('GSC_CLIENT_EMAIL')
  };

  const allEnvVarsPresent = Object.values(envVars).every(v => v);
  diagnostics.checks[0].status = allEnvVarsPresent ? '✅ PASS' : '❌ FAIL';
  diagnostics.checks[0].details = envVars;
  diagnostics.checks[0].message = allEnvVarsPresent 
    ? 'All required environment variables are set' 
    : 'Missing one or more required environment variables';

  if (!allEnvVarsPresent) {
    return new Response(JSON.stringify(diagnostics, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // CHECK 2: Private Key Format
  diagnostics.checks.push({
    step: '2. Private Key Format',
    status: 'checking...'
  });

  try {
    const privateKey = Netlify.env.get('GSC_PRIVATE_KEY');
    const hasNewlines = privateKey.includes('\\n');
    const startsCorrectly = privateKey.startsWith('-----BEGIN PRIVATE KEY-----');
    const endsCorrectly = privateKey.includes('-----END PRIVATE KEY-----');
    
    diagnostics.checks[1].status = (startsCorrectly && endsCorrectly) ? '✅ PASS' : '❌ FAIL';
    diagnostics.checks[1].details = {
      hasNewlines,
      startsCorrectly,
      endsCorrectly,
      length: privateKey.length
    };
    diagnostics.checks[1].message = (startsCorrectly && endsCorrectly)
      ? 'Private key format appears correct'
      : 'Private key format may be incorrect';
  } catch (err) {
    diagnostics.checks[1].status = '❌ ERROR';
    diagnostics.checks[1].error = err.message;
  }

  // CHECK 3: OAuth2 Token Generation
  diagnostics.checks.push({
    step: '3. OAuth2 Token Generation',
    status: 'checking...'
  });

  try {
    const credentials = {
      client_email: Netlify.env.get('GSC_CLIENT_EMAIL'),
      private_key: Netlify.env.get('GSC_PRIVATE_KEY').replace(/\\n/g, '\n')
    };
    
    const jwtHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    
    const now = Math.floor(Date.now() / 1000);
    const jwtClaim = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };
    
    const jwtClaimBase64 = Buffer.from(JSON.stringify(jwtClaim)).toString('base64url');
    const signatureInput = `${jwtHeader}.${jwtClaimBase64}`;
    
    const crypto = await import('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(credentials.private_key, 'base64url');
    
    const jwt = `${signatureInput}.${signature}`;
    
    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    
    const data = await response.json();
    
    if (data.error) {
      diagnostics.checks[2].status = '❌ FAIL';
      diagnostics.checks[2].error = data.error;
      diagnostics.checks[2].errorDescription = data.error_description;
      diagnostics.checks[2].message = 'OAuth2 token request failed';
    } else {
      diagnostics.checks[2].status = '✅ PASS';
      diagnostics.checks[2].message = 'Successfully obtained OAuth2 access token';
      diagnostics.checks[2].tokenPreview = data.access_token.substring(0, 20) + '...';
    }
  } catch (err) {
    diagnostics.checks[2].status = '❌ ERROR';
    diagnostics.checks[2].error = err.message;
    diagnostics.checks[2].stack = err.stack;
  }

  // CHECK 4: Netlify Blobs Access
  diagnostics.checks.push({
    step: '4. Netlify Blobs Access',
    status: 'checking...'
  });

  try {
    const store = getStore('events');
    const eventsData = await store.get('grantParkEvents');
    const events = eventsData ? JSON.parse(eventsData) : [];
    
    diagnostics.checks[3].status = '✅ PASS';
    diagnostics.checks[3].message = `Successfully loaded ${events.length} events from Netlify Blobs`;
    diagnostics.checks[3].eventCount = events.length;
    diagnostics.checks[3].publishedCount = events.filter(e => e.published).length;
  } catch (err) {
    diagnostics.checks[3].status = '❌ ERROR';
    diagnostics.checks[3].error = err.message;
    diagnostics.checks[3].stack = err.stack;
  }

  // CHECK 5: GSC API Test Query (single URL)
  diagnostics.checks.push({
    step: '5. GSC API Test Query',
    status: 'checking...'
  });

  try {
    // Only attempt if we got an access token
    const tokenCheck = diagnostics.checks[2];
    if (tokenCheck.status === '✅ PASS') {
      // Get token again for test query
      const credentials = {
        client_email: Netlify.env.get('GSC_CLIENT_EMAIL'),
        private_key: Netlify.env.get('GSC_PRIVATE_KEY').replace(/\\n/g, '\n')
      };
      
      const jwtHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
      const now = Math.floor(Date.now() / 1000);
      const jwtClaim = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      };
      
      const jwtClaimBase64 = Buffer.from(JSON.stringify(jwtClaim)).toString('base64url');
      const signatureInput = `${jwtHeader}.${jwtClaimBase64}`;
      
      const crypto = await import('crypto');
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(signatureInput);
      const signature = sign.sign(credentials.private_key, 'base64url');
      const jwt = `${signatureInput}.${signature}`;
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Test with homepage
      const testUrl = 'https://www.grantparkevents.com/';
      const gscResponse = await fetch(
        'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inspectionUrl: testUrl,
            siteUrl: 'sc-domain:grantparkevents.com'
          })
        }
      );

      if (!gscResponse.ok) {
        const errorText = await gscResponse.text();
        diagnostics.checks[4].status = '❌ FAIL';
        diagnostics.checks[4].httpStatus = gscResponse.status;
        diagnostics.checks[4].error = errorText;
        diagnostics.checks[4].message = 'GSC API request failed';
      } else {
        const gscData = await gscResponse.json();
        diagnostics.checks[4].status = '✅ PASS';
        diagnostics.checks[4].message = 'Successfully queried GSC API';
        diagnostics.checks[4].testUrl = testUrl;
        diagnostics.checks[4].indexStatus = gscData.inspectionResult?.indexStatusResult?.verdict || 'unknown';
      }
    } else {
      diagnostics.checks[4].status = '⏭️ SKIP';
      diagnostics.checks[4].message = 'Skipped - OAuth2 token not available';
    }
  } catch (err) {
    diagnostics.checks[4].status = '❌ ERROR';
    diagnostics.checks[4].error = err.message;
    diagnostics.checks[4].stack = err.stack;
  }

  // SUMMARY
  const passedChecks = diagnostics.checks.filter(c => c.status === '✅ PASS').length;
  const totalChecks = diagnostics.checks.filter(c => c.status !== '⏭️ SKIP').length;
  
  diagnostics.summary = {
    passed: passedChecks,
    total: totalChecks,
    allPassed: passedChecks === totalChecks,
    recommendation: passedChecks === totalChecks 
      ? 'All checks passed! The gsc-index-status function should work.'
      : 'One or more checks failed. Review the details above to identify the issue.'
  };

  return new Response(JSON.stringify(diagnostics, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
