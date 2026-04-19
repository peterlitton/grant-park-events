// ================================================
// GET-VERSION.JS
// ================================================
// Netlify function to return current deployed version
// Call: /.netlify/functions/get-version
// Returns: JSON with version info
//
// Build10.14.8.3: Reads from deployed build-version.js (single source)
// Previously imported from version.js — now eliminated that dependency
// ================================================

export default async (req, context) => {
  try {
    // Fetch the deployed build-version.js and parse it
    const response = await fetch(`${process.env.URL}/build-version.js`);
    const content = await response.text();
    
    // Extract values using regex
    const versionMatch = content.match(/BUILD_VERSION\s*=\s*'([^']+)'/);
    const dateMatch = content.match(/BUILD_DATE\s*=\s*'([^']+)'/);
    const notesMatch = content.match(/BUILD_NOTES\s*=\s*'([^']+)'/);
    
    if (!versionMatch) {
      throw new Error('Could not parse BUILD_VERSION from build-version.js');
    }
    
    return new Response(JSON.stringify({
      version: versionMatch[1],
      buildDate: dateMatch ? dateMatch[1] : 'unknown',
      notes: notesMatch ? notesMatch[1] : '',
      source: 'build-version.js',
      deployedAt: new Date().toISOString(),
      status: 'deployed'
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Could not determine version',
      message: error.message,
      status: 'error'
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
