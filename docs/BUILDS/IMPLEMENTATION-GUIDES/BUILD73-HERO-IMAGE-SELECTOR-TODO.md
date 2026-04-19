# HERO IMAGE SELECTOR UI - BUILD73 IMPLEMENTATION NOTE

**Status:** API complete (list-event-images.js), UI deferred due to complexity

**What's Done:**
- ✅ /netlify/functions/list-event-images.js (working in BUILD72)
- ✅ API returns JSON array of images in /assets/events/

**What's Needed:**
Add to admin.html CampaignBuilder component around line 2004

## STATE ADDITIONS (after line 2005):

```javascript
const [showImageBrowser, setShowImageBrowser] = useState(false);
const [availableImages, setAvailableImages] = useState([]);
const [loadingImages, setLoadingImages] = useState(false);
```

## FUNCTION TO LOAD IMAGES:

```javascript
const loadImages = async () => {
  setLoadingImages(true);
  try {
    const response = await fetch('/api/list-event-images');
    const data = await response.json();
    setAvailableImages(data.images || []);
  } catch (error) {
    console.error('Failed to load images:', error);
    setAvailableImages([]);
  } finally {
    setLoadingImages(false);
  }
};
```

## UI CHANGES (find Hero Image input around line 2180):

**Replace the input field with:**

```javascript
React.createElement('div', { className: 'flex gap-2' },
  React.createElement('input', {
    type: 'text',
    className: 'flex-1 px-3 py-2 border border-gray-300 rounded-lg',
    placeholder: 'grant-park-pavilion.jpg',
    value: formData.heroImage,
    onChange: (e) => setFormData({ ...formData, heroImage: e.target.value })
  }),
  React.createElement('button', {
    type: 'button',
    onClick: () => { setShowImageBrowser(true); loadImages(); },
    className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap'
  }, '📁 Browse')
)
```

## MODAL (add before final closing of CampaignBuilder, around line 2600):

```javascript
showImageBrowser && React.createElement('div', {
  className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
  onClick: () => setShowImageBrowser(false)
},
  React.createElement('div', {
    className: 'bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto',
    onClick: (e) => e.stopPropagation()
  },
    React.createElement('div', { className: 'flex justify-between items-center mb-4' },
      React.createElement('h3', { className: 'text-xl font-bold' }, 'Select Hero Image'),
      React.createElement('button', {
        onClick: () => setShowImageBrowser(false),
        className: 'text-gray-500 hover:text-gray-700 text-2xl'
      }, '×')
    ),
    
    loadingImages 
      ? React.createElement('p', { className: 'text-center py-8' }, '⏳ Loading images...')
      : availableImages.length === 0
        ? React.createElement('p', { className: 'text-center py-8 text-gray-500' }, 'No images found in /assets/events/')
        : React.createElement('div', { className: 'grid grid-cols-3 gap-4' },
            availableImages.map(img => 
              React.createElement('div', {
                key: img.filename,
                className: 'cursor-pointer border-2 border-gray-200 hover:border-blue-500 rounded overflow-hidden transition',
                onClick: () => {
                  setFormData({ ...formData, heroImage: img.filename });
                  setShowImageBrowser(false);
                }
              },
                React.createElement('img', {
                  src: img.url,
                  alt: img.filename,
                  className: 'w-full h-32 object-cover'
                }),
                React.createElement('p', { className: 'text-xs p-2 text-center truncate bg-gray-50' }, img.filename)
              )
            )
          ),
    
    React.createElement('button', {
      onClick: () => setShowImageBrowser(false),
      className: 'mt-4 w-full px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
    }, 'Cancel')
  )
)
```

## TESTING:

1. Go to Email Campaigns tab
2. Click "Create Email Campaign"
3. Find "Hero Image" field
4. See [📁 Browse] button next to input
5. Click Browse → Modal opens with grid of images
6. Click image → Filename populates field
7. Modal closes

## FILES TO MODIFY:
- admin.html (add state, function, UI changes)

**Estimated time: 30 minutes manual implementation**
