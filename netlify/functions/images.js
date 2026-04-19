// ================================================
// IMAGE UPLOAD AND SERVE FUNCTION
// ================================================
// v2.3.1-1: New Image Manager feature
// - POST: Upload image to Netlify Blobs
// - GET: Serve image from Netlify Blobs
// Images persist across deploys
// ================================================

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("images");
  const url = new URL(req.url);
  
  // Extract filename from path: /.netlify/functions/images/filename.jpg
  const pathParts = url.pathname.split('/');
  const filename = pathParts[pathParts.length - 1];
  
  // CORS headers for all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  // ============================================
  // GET - Serve image from Blobs
  // ============================================
  if (req.method === "GET") {
    // If no filename or just "images", return error
    if (!filename || filename === "images") {
      return new Response(JSON.stringify({ error: "No filename specified" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    try {
      // Get image with metadata
      const result = await store.getWithMetadata(filename, { type: "arrayBuffer" });
      
      if (!result || !result.data) {
        return new Response(JSON.stringify({ error: "Image not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Determine content type from metadata or filename
      const contentType = result.metadata?.contentType || getMimeType(filename);
      
      return new Response(result.data, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000" // Cache for 1 year
        }
      });
    } catch (error) {
      console.error("[images] GET error:", error);
      return new Response(JSON.stringify({ error: "Failed to retrieve image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  
  // ============================================
  // POST - Upload image to Blobs
  // ============================================
  if (req.method === "POST") {
    try {
      const formData = await req.formData();
      const file = formData.get("file");
      const overwrite = formData.get("overwrite") === "true";
      const customFilename = formData.get("filename"); // Optional custom filename
      
      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({ 
          error: "Invalid file type. Allowed: jpg, png, gif, webp" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return new Response(JSON.stringify({ 
          error: "File too large. Maximum size: 5MB" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Use custom filename or sanitize original
      const finalFilename = customFilename || sanitizeFilename(file.name);
      
      // Check if file exists (unless overwrite is true)
      if (!overwrite) {
        try {
          const existing = await store.getWithMetadata(finalFilename);
          if (existing && existing.data) {
            return new Response(JSON.stringify({ 
              error: "exists",
              filename: finalFilename,
              message: "File already exists. Overwrite?" 
            }), {
              status: 409, // Conflict
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        } catch (e) {
          // File doesn't exist, continue
        }
      }
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Store with metadata
      await store.set(finalFilename, arrayBuffer, {
        metadata: {
          contentType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString()
        }
      });
      
      console.log(`[images] Uploaded: ${finalFilename} (${file.size} bytes)`);
      
      return new Response(JSON.stringify({ 
        success: true,
        filename: finalFilename,
        size: file.size,
        url: `/.netlify/functions/images/${finalFilename}`
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
      
    } catch (error) {
      console.error("[images] POST error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
};

// ============================================
// Helper Functions
// ============================================

// Get MIME type from filename
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  return types[ext] || 'application/octet-stream';
}

// Sanitize filename for safe storage
function sanitizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
