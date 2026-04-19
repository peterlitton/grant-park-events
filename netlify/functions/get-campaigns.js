import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("campaigns");
  
  try {
    const campaignsData = await store.get("grantParkCampaigns");
    
    if (!campaignsData) {
      // Return empty array if no campaigns exist yet
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    return new Response(campaignsData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    
  } catch (error) {
    console.error('[ERROR] get-campaigns:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
