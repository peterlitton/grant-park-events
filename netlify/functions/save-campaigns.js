import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Build10.30: Auth check
  const authHeader = req.headers.get('authorization');
  const token = process.env.GPE_ADMIN_TOKEN;
  if (!authHeader || authHeader !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  
  const store = getStore("campaigns");
  
  try {
    const campaigns = await req.json();
    
    // Validate campaigns data
    if (!Array.isArray(campaigns)) {
      return new Response(JSON.stringify({ error: "Campaigns must be an array" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    // Save to Blobs
    await store.set("grantParkCampaigns", JSON.stringify(campaigns));
    
    console.log('[STORAGE] Saved', campaigns.length, 'campaigns to Netlify Blobs');
    
    return new Response(JSON.stringify({ success: true, count: campaigns.length }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    
  } catch (error) {
    console.error('[ERROR] save-campaigns:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
