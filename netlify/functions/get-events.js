import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("events");
  
  try {
    const eventsData = await store.get("grantParkEvents");
    
    if (!eventsData) {
      // Return empty array - admin should call init-events first
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    return new Response(eventsData, {
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
