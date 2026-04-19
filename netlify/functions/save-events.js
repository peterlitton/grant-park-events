import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Build10.30: CORS preflight
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
  
  const store = getStore("events");
  
  try {
    const events = await req.json();
    
    // Validate events data
    if (!Array.isArray(events)) {
      return new Response(JSON.stringify({ error: "Events must be an array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Save to Blobs
    await store.set("grantParkEvents", JSON.stringify(events));
    
    return new Response(JSON.stringify({ success: true, count: events.length }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
