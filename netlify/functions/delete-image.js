// ================================================
// DELETE IMAGE FUNCTION
// ================================================
// v2.3.1-1: New Image Manager feature
// Removes an image from blob storage
// ================================================

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  // Accept both DELETE and POST (for broader compatibility)
  if (req.method !== "DELETE" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // Build10.30: Auth check
  const authHeader = req.headers.get('authorization');
  const token = process.env.GPE_ADMIN_TOKEN;
  if (!authHeader || authHeader !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const body = await req.json();
    const { filename } = body;
    
    if (!filename) {
      return new Response(JSON.stringify({ error: "No filename provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const store = getStore("images");
    
    // Check if file exists first
    try {
      const existing = await store.get(filename, { type: "arrayBuffer" });
      if (!existing) {
        return new Response(JSON.stringify({ 
          error: "Image not found",
          filename: filename
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "Image not found",
        filename: filename
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Delete the image
    await store.delete(filename);
    
    console.log(`[delete-image] Deleted: ${filename}`);
    
    return new Response(JSON.stringify({ 
      success: true,
      filename: filename,
      message: "Image deleted successfully"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("[delete-image] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
