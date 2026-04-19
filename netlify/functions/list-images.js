// ================================================
// LIST IMAGES FUNCTION
// ================================================
// v2.3.1-1: New Image Manager feature
// Returns list of all images in blob storage with metadata
// ================================================

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  
  try {
    const store = getStore("images");
    const images = [];
    
    // List all blobs in the images store
    const { blobs } = await store.list();
    
    // Get metadata for each image
    for (const blob of blobs) {
      try {
        const result = await store.getWithMetadata(blob.key, { type: "arrayBuffer" });
        images.push({
          filename: blob.key,
          url: `/.netlify/functions/images/${blob.key}`,
          size: result.metadata?.size || 0,
          contentType: result.metadata?.contentType || "unknown",
          uploadedAt: result.metadata?.uploadedAt || null
        });
      } catch (e) {
        // Include even if metadata fails
        images.push({
          filename: blob.key,
          url: `/.netlify/functions/images/${blob.key}`,
          size: 0,
          contentType: "unknown",
          uploadedAt: null
        });
      }
    }
    
    // Sort by upload date (newest first), then by filename
    images.sort((a, b) => {
      if (a.uploadedAt && b.uploadedAt) {
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
      if (a.uploadedAt) return -1;
      if (b.uploadedAt) return 1;
      return a.filename.localeCompare(b.filename);
    });
    
    console.log(`[list-images] Returning ${images.length} images`);
    
    return new Response(JSON.stringify({ 
      success: true,
      count: images.length,
      images: images
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("[list-images] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
