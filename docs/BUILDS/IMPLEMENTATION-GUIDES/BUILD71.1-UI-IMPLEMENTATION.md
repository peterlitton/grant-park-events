# BUILD71.1 - SOCIAL MEDIA UI CODE

## 📋 IMPLEMENTATION INSTRUCTIONS

This file contains the exact code to add to admin.html for the Social Media tab.

---

## STEP 1: Add State Variables

**Location:** Around line 1200 in admin.html, in the AdminPanel component after existing useState declarations

**Add these lines:**

```javascript
// Social Media state (Build71.1)
const [socialPosts, setSocialPosts] = useState([]);
const [socialLoading, setSocialLoading] = useState(false);
const [socialDays, setSocialDays] = useState(7);
const [copiedPost, setCopiedPost] = useState(null);
```

---

## STEP 2: Add Social Media Tab Content

**Location:** Around line 2100, after the Build Metrics tab content (after `: activeTab === 'metrics'`)

**Add this complete tab:**

```javascript
: activeTab === 'social' ?
  // SOCIAL MEDIA TAB (Build71.1)
  React.createElement('div', { className: 'space-y-6' },
    // Header
    React.createElement('div', { className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8' },
      React.createElement('h2', { className: 'text-3xl font-bold mb-2' }, '📱 Social Media Automation'),
      React.createElement('p', { className: 'text-blue-100' }, 
        'Generate ready-to-post content for Facebook and Instagram'
      )
    ),
    
    // Quick Links
    React.createElement('div', { className: 'bg-blue-50 border border-blue-200 rounded-lg p-4' },
      React.createElement('div', { className: 'flex items-center gap-4 flex-wrap' },
        React.createElement('span', { className: 'font-semibold text-blue-900' }, '🔗 Quick Links:'),
        React.createElement('a', {
          href: '/.netlify/functions/rss-feed',
          target: '_blank',
          className: 'text-blue-600 hover:underline text-sm'
        }, 'RSS Feed'),
        React.createElement('span', { className: 'text-gray-400' }, '|'),
        React.createElement('a', {
          href: 'https://business.facebook.com/latest/composer',
          target: '_blank',
          className: 'text-blue-600 hover:underline text-sm'
        }, 'Meta Business Suite'),
        React.createElement('span', { className: 'text-gray-400' }, '|'),
        React.createElement('a', {
          href: 'https://ifttt.com/',
          target: '_blank',
          className: 'text-blue-600 hover:underline text-sm'
        }, 'IFTTT Setup')
      )
    ),
    
    // Post Generator
    React.createElement('div', { className: 'bg-white rounded-xl shadow-md p-6' },
      React.createElement('h3', { className: 'text-xl font-bold mb-4' }, 'Generate Posts'),
      
      // Controls
      React.createElement('div', { className: 'flex gap-4 mb-6' },
        React.createElement('div', {},
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 
            'Number of Days'
          ),
          React.createElement('input', {
            type: 'number',
            min: 1,
            max: 30,
            value: socialDays,
            onChange: (e) => setSocialDays(parseInt(e.target.value) || 7),
            className: 'px-4 py-2 border rounded-lg w-24'
          })
        ),
        React.createElement('div', { className: 'flex-1' }),
        React.createElement('button', {
          onClick: async () => {
            setSocialLoading(true);
            try {
              const response = await fetch(`/.netlify/functions/social-posts?action=generate&days=${socialDays}`);
              const data = await response.json();
              setSocialPosts(data.posts || []);
            } catch (err) {
              alert('Error generating posts: ' + err.message);
            } finally {
              setSocialLoading(false);
            }
          },
          disabled: socialLoading,
          className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold'
        }, socialLoading ? '⏳ Generating...' : `Generate Next ${socialDays} Days`)
      ),
      
      // Template Buttons
      React.createElement('div', { className: 'grid grid-cols-3 gap-4 mb-6' },
        React.createElement('button', {
          onClick: async () => {
            setSocialLoading(true);
            try {
              const response = await fetch('/.netlify/functions/social-posts?action=roundup');
              const data = await response.json();
              setSocialPosts([data.post]);
            } catch (err) {
              alert('Error: ' + err.message);
            } finally {
              setSocialLoading(false);
            }
          },
          className: 'px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold'
        }, '🎉 Weekend Roundup'),
        React.createElement('button', {
          onClick: async () => {
            setSocialLoading(true);
            try {
              const response = await fetch('/.netlify/functions/social-posts?action=preview');
              const data = await response.json();
              setSocialPosts([data.post]);
            } catch (err) {
              alert('Error: ' + err.message);
            } finally {
              setSocialLoading(false);
            }
          },
          className: 'px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold'
        }, '🌟 Week Preview'),
        React.createElement('button', {
          onClick: () => {
            if (socialPosts.length === 0) {
              alert('No posts to copy! Generate posts first.');
              return;
            }
            const allText = socialPosts.map((p, i) => `--- POST ${i+1} ---\n${p.text}\n\n`).join('\n');
            navigator.clipboard.writeText(allText);
            alert(`Copied ${socialPosts.length} posts to clipboard!`);
          },
          disabled: socialPosts.length === 0,
          className: 'px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50'
        }, '📋 Copy All Posts')
      ),
      
      // Generated Posts
      socialPosts.length > 0 ? React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
          React.createElement('h4', { className: 'font-bold text-lg' }, 
            `Generated Posts (${socialPosts.length})`
          ),
          React.createElement('span', { className: 'text-sm text-gray-500' }, 
            'Click any post to copy to clipboard'
          )
        ),
        
        // Post Cards
        socialPosts.map((post, index) => 
          React.createElement('div', {
            key: index,
            onClick: () => {
              navigator.clipboard.writeText(post.text);
              setCopiedPost(index);
              setTimeout(() => setCopiedPost(null), 2000);
            },
            className: `border-2 rounded-lg p-4 cursor-pointer transition-all ${
              copiedPost === index 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
            }`
          },
            // Post Header
            React.createElement('div', { className: 'flex items-start justify-between mb-3' },
              React.createElement('div', {},
                React.createElement('span', { 
                  className: 'inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-2'
                }, post.type ? post.type.replace('_', ' ').toUpperCase() : 'POST'),
                post.eventTitle && React.createElement('div', { className: 'text-sm font-semibold text-gray-700 mt-1' }, 
                  post.eventTitle
                )
              ),
              React.createElement('div', { className: 'text-right' },
                React.createElement('div', { className: 'text-xs text-gray-500' }, 
                  `${post.characterCount || post.text.length} characters`
                ),
                copiedPost === index && React.createElement('div', { className: 'text-xs text-green-600 font-semibold mt-1' }, 
                  '✓ Copied!'
                )
              )
            ),
            
            // Post Text Preview
            React.createElement('div', { 
              className: 'bg-gray-50 rounded p-3 mb-3 whitespace-pre-wrap text-sm font-mono'
            }, post.text.substring(0, 200) + (post.text.length > 200 ? '...' : '')),
            
            // Post Footer
            React.createElement('div', { className: 'flex items-center gap-4 text-xs text-gray-500' },
              post.platform && React.createElement('span', {}, `📱 ${post.platform}`),
              post.url && React.createElement('span', {}, `🔗 Includes link`),
              post.scheduledFor && React.createElement('span', {}, `📅 ${post.scheduledFor}`)
            )
          )
        )
      ) : React.createElement('div', { className: 'text-center py-12 text-gray-500' },
        React.createElement('div', { className: 'text-4xl mb-4' }, '📱'),
        React.createElement('p', {}, 'Click "Generate" to create social media posts')
      )
    ),
    
    // Info Panel
    React.createElement('div', { className: 'bg-gray-50 border border-gray-200 rounded-lg p-6' },
      React.createElement('h4', { className: 'font-bold mb-3' }, '💡 How to Use'),
      React.createElement('ol', { className: 'list-decimal list-inside space-y-2 text-sm text-gray-700' },
        React.createElement('li', {}, 'Click "Generate Next 7 Days" to create posts for upcoming events'),
        React.createElement('li', {}, 'Click any post card to copy it to your clipboard'),
        React.createElement('li', {}, 'Paste into Meta Business Suite to schedule'),
        React.createElement('li', {}, 'Or use "Copy All Posts" to get all posts at once'),
        React.createElement('li', {}, 'For automation: Set up IFTTT with your RSS feed (see Quick Links above)')
      )
    )
  )
```

---

## STEP 3: Test the Implementation

After adding the code:

1. **Reload admin panel**
2. **Click "Social Media" tab**
3. **Click "Generate Next 7 Days"**
4. **Verify posts appear**
5. **Click a post card**
6. **Verify "Copied!" message appears**
7. **Paste into a text editor to verify clipboard**

---

## 📊 WHAT THIS UI PROVIDES

**Features:**
- ✅ Generate posts for next N days (customizable)
- ✅ Weekend roundup generator
- ✅ Week preview generator
- ✅ Individual post copy (click card)
- ✅ Batch copy all posts
- ✅ Visual post preview
- ✅ Character count
- ✅ Post type indicators
- ✅ Quick links to RSS feed & Meta Business Suite
- ✅ Usage instructions

**User Experience:**
- Simple, intuitive interface
- One-click post generation
- One-click copy to clipboard
- Visual feedback (green border when copied)
- Clear post organization
- Professional appearance

---

## 🎨 VISUAL DESIGN

**Color Scheme:**
- Blue/Purple gradient header
- Blue accents for primary actions
- Purple for weekend posts
- Green for week preview
- Gray for utilities
- Green feedback for copied state

**Layout:**
- Clear header with description
- Quick links bar
- Generator controls
- Template shortcuts
- Post cards grid
- Help section

---

## 🔧 FUTURE ENHANCEMENTS (Optional)

**Could add later:**
- Post editing before copy
- Image preview
- Schedule calendar view
- Analytics dashboard
- Draft saving
- Custom templates

---

END OF BUILD71.1 UI CODE
