# Build74 On-Demand Builder Research

## Problem Summary
Build74 implemented On-Demand Builders for event-specific SEO, but the builder was not being invoked. Requests to `/.netlify/builders/event-page` were redirected to `index.html`.

## Root Cause Analysis

### Issue #1: Redirect Shadowing
The catch-all redirect `/* → /index.html` was intercepting requests to the builder endpoint.

**However**, this shouldn't happen because:
- `/.netlify/*` paths are supposed to be handled by Netlify's infrastructure BEFORE redirect processing
- The redirect order was correct (`/events/*` before `/*`)

### Issue #2: Function Not Recognized as Builder
The more likely cause is that Netlify wasn't recognizing the function as a builder. Possible reasons:

1. **ES Modules vs CommonJS**: Our function uses ES modules (`import`), but the builder wrapper might expect CommonJS
2. **Build process issue**: The function might not be properly bundled during Netlify build
3. **Path issue**: Function is at `netlify/functions/event-page.js` but redirect points to `/.netlify/builders/event-page`

## Key Documentation Findings

### On-Demand Builders Are Legacy
From Netlify docs (2024-2025):
> "Consider serverless functions with the `durable` directive instead of On-demand Builders for better performance and fewer function invocations."

On-Demand Builders were designed for Next.js ISR support in the older runtime. Netlify now recommends using **cache headers with the `durable` directive** instead.

### Better Alternative: Durable Cache with Serverless Functions

Instead of:
```javascript
import { builder } from "@netlify/functions";
export const handler = builder(myHandler);
```

Use:
```javascript
export default async (req, context) => {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, durable, s-maxage=3600, stale-while-revalidate=604800"
    }
  });
};
```

### Key Benefits of Durable Directive
1. **Global caching**: Stored in shared cache accessible to all edge nodes
2. **Stale-while-revalidate**: Serve stale content while refreshing in background
3. **Cache tags**: Purge specific cached objects by tag
4. **Standard HTTP headers**: More control than builder() wrapper

### Implementation for GPE

For Build75, use a **regular serverless function** with durable cache headers:

```javascript
// netlify/functions/event-page.js
import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Extract event ID from path
  const match = path.match(/\/events\/.*-(\d+)$/);
  if (!match) {
    return new Response("Event not found", { status: 404 });
  }
  
  const eventId = match[1];
  const store = getStore({ name: "events", consistency: "strong" });
  const events = await store.get("all", { type: "json" });
  const event = events?.find(e => String(e.id) === eventId);
  
  if (!event) {
    return new Response("Event not found", { status: 404 });
  }
  
  const html = generateEventHTML(event);
  
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, durable, s-maxage=3600, stale-while-revalidate=86400",
      "Netlify-Cache-Tag": `event-${eventId}`
    }
  });
};

export const config = {
  path: "/events/*"
};
```

### Redirect Configuration

With the new function format and `config.path`, you may not need a redirect at all. The function will automatically handle `/events/*` paths.

If redirect is still needed:
```toml
[[redirects]]
  from = "/events/*"
  to = "/.netlify/functions/event-page"
  status = 200
```

Note: Use `/.netlify/functions/` NOT `/.netlify/builders/`

### Cache Purging on Event Save

Use `purgeCache` from `@netlify/functions`:

```javascript
import { purgeCache } from "@netlify/functions";

// In save-events.js when an event is updated:
await purgeCache({ tags: [`event-${eventId}`] });
```

## Action Items for Build75

1. **Replace builder() wrapper** with regular function using durable cache headers
2. **Use `config.path`** for function routing instead of redirects
3. **Add cache tags** for per-event purging
4. **Update save-events.js** to purge cache on event save
5. **Test locally** with `netlify dev` (note: caching won't work locally)
6. **Deploy and verify** function is invoked by checking Netlify function logs

## Testing Strategy

1. Deploy to Netlify
2. Check Netlify deploy logs for function registration
3. Visit `/.netlify/functions/event-page` directly to test function
4. Check Netlify function logs in dashboard
5. Visit `/events/[slug]` and view page source to verify server-rendered HTML

## References

- https://docs.netlify.com/build/configure-builds/on-demand-builders/
- https://docs.netlify.com/platform/caching/ (durable directive)
- https://docs.netlify.com/platform/request-chain/
- https://developers.netlify.com/guides/how-to-do-isr-and-advanced-caching-with-remix/

## Conclusion

On-Demand Builders are a legacy feature. The modern approach is to use regular serverless functions with `Netlify-CDN-Cache-Control: durable` header. This provides better control, global caching, and cache tag support for targeted invalidation.
