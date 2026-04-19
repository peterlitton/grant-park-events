# EmailOctopus API Field Verification

**Based on official API documentation:** https://emailoctopus.com/api-documentation/lists/create-contact

---

## ✅ API STRUCTURE (Confirmed Correct)

### **Official EmailOctopus API Format:**
```javascript
POST /api/1.6/lists/{listId}/contacts
{
  "api_key": "...",
  "email_address": "user@example.com",
  "fields": {
    "FirstName": "Joe",      // ← Using field TAG as key
    "LastName": "Bloggs",    // ← Using field TAG as key
    "Birthday": "2020-12-20" // ← Using field TAG as key
  },
  "tags": ["vip"],
  "status": "SUBSCRIBED"
}
```

**Key point from documentation:**
> "fields (object, optional) - An object containing key/value pairs of field values, **using the field's tag as the key**."

---

## 🔍 YOUR EMAILOCTOPUS FIELDS

You created these custom fields:
1. **OriginalSource** (text field)
2. **DateAdded** (date field)

---

## ⚠️ CRITICAL QUESTION

**What are the FIELD TAGS in your EmailOctopus?**

The field **label** (what you see in the UI) might be different from the field **tag** (what the API uses).

### **How to check your field tags:**

1. Go to EmailOctopus dashboard
2. Select your list
3. Click **Settings** → **Fields**
4. For each field, you'll see:
   - **Label** (display name) - e.g., "Original Source"
   - **Tag** (API key) - e.g., "OriginalSource" or "original_source"

---

## 📊 LIKELY SCENARIOS

### **Scenario 1: Tags match labels exactly**
- Field label: `OriginalSource`
- Field tag: `OriginalSource`
- **Our code:** ✅ Correct (using `OriginalSource`)

### **Scenario 2: Tags are different**
- Field label: `Original Source` (with space)
- Field tag: `original_source` (lowercase, underscore)
- **Our code:** ❌ Wrong (we're using `OriginalSource`)
- **Fix needed:** Change to `original_source`

### **Scenario 3: EmailOctopus auto-generated tags**
- Field label: `OriginalSource`
- Field tag: `field_1` (auto-generated)
- **Our code:** ❌ Wrong
- **Fix needed:** Change to `field_1`

---

## 🎯 CURRENT BUILD26 CODE

### **What we're sending:**
```javascript
// Frontend
{
  email: "user@example.com",
  OriginalSource: "POPUP",
  DateAdded: "2026-01-29..."
}

// Netlify Function
{
  api_key: "...",
  email_address: "user@example.com",
  fields: {
    OriginalSource: "POPUP",      // ← Assuming tag is "OriginalSource"
    DateAdded: "2026-01-29..."     // ← Assuming tag is "DateAdded"
  }
}
```

---

## ✅ NEXT STEPS

**Please check your EmailOctopus field tags:**

1. Log into EmailOctopus
2. Go to your list → Settings → Fields
3. Find the **Tag** for:
   - OriginalSource field
   - DateAdded field

**Possible tags you might see:**
- `OriginalSource` and `DateAdded` ✅ (our code is correct)
- `original_source` and `date_added` ❌ (need to lowercase)
- `field_1` and `field_2` ❌ (need to use auto-generated tags)
- Something else ❌ (need to match exactly)

---

## 📝 IF TAGS DON'T MATCH

**Tell me the exact field tags and I'll update the code immediately.**

Example response:
"The tag for OriginalSource is `original_source` and the tag for DateAdded is `date_added`"

Then I'll create build27 with the correct tags.

---

## 💡 WHY THIS MATTERS

**EmailOctopus API is case-sensitive and exact-match only.**

If we send:
```javascript
fields: {
  OriginalSource: "POPUP"  // Tag doesn't exist
}
```

But the actual tag is `original_source`, then EmailOctopus will:
- ❌ Ignore the field
- ❌ NOT save the data
- ✅ Still create the contact (but without custom field data)

**This is why we need to verify the exact tag names!**

