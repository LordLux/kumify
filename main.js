(() => {
    const numImages = 102;
    let overlayEnabled = true;

    // See whether overlays are even enabled
    chrome.storage.local.get(['overlayEnabled'], (result) => {
        //result is an object that contains the data retrieved from chrome.storage.local.get
        //overlayEnabled is an attribute of result
        overlayEnabled = result.overlayEnabled !== false; // default to true if not set
        const opacity = overlayEnabled ? '1' : '0';

        // get all yt thumbnails
        function getThumbnails() {
            const thumbnails = document.querySelectorAll("ytd-thumbnail:not(.ytd-video-preview, .ytd-rich-grid-slim-media) a > yt-image > img.yt-core-image:only-child:not(.yt-core-attributed-string__image-element),.ytp-videowall-still-image:not([style*='extension:'])");

            // For each image in the thumbnails array (which is thumbnail), get its image index, its base url, and then send it to 
            // apply thumbnails for a merge
            thumbnails.forEach((thumbnail) => {
                const index = getRandomImageIndex();
                // Get the URL of the random image
                let OverlayUrl = getOverlayUrl(index);
                changeThumbnail(thumbnail, OverlayUrl);
            });
        }

        // Apply new (and improved) thumbnails
        function changeThumbnail(thumbnail, OverlayUrl) {

            if (thumbnail.dataset.overlayApplied) return;

            // Create the overlay image
            const overlay = document.createElement("img");
            overlay.src = OverlayUrl;
            overlay.style.position = "absolute";
            overlay.style.top = overlay.style.left = "0";
            overlay.style.width = overlay.style.height = "100%";
            overlay.style.zIndex = "0";
            overlay.style.opacity = opacity; // Apply the opacity here
            overlay.dataset.kumifyOverlay = "true";
            // Overlay is appended as a child of the original image's parent element (the thing we did query select), making it go on top
            thumbnail.parentElement.appendChild(overlay);
            thumbnail.dataset.overlayApplied = "true";
        }

        // Get random image index
        function getRandomImageIndex() {
            return Math.floor(Math.random() * (numImages) + 1);
        }

        // Get URL of the overlay image
        function getOverlayUrl(index) {
            return chrome.runtime.getURL(`assets/images/${index}.PNG`);
        }
        
        // Listen for toggle messages
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "toggleImages") {
                // Toggle the state
                overlayEnabled = !overlayEnabled;
                
                // Update storage
                chrome.storage.local.set({ overlayEnabled });
                
                // Update existing overlays
                toggleExistingOverlays(overlayEnabled);
                
                // Send response to confirm action was performed
                sendResponse({ success: true, newState: overlayEnabled });
                return true; // Keep the message channel open for sendResponse
            }
        });

        // Observe the entire body of the document for changes
        const observer = new MutationObserver(() => {
            getThumbnails();
        });
        observer.observe(document.body, {
            // Types of mutations to observe
            childList: true,
            subtree: true,
        });

        // Initial call to set thumbnails on page load
        getThumbnails();
    });
    
    
    // Add function to toggle existing overlays
    function toggleExistingOverlays(enabled) {
        const overlays = document.querySelectorAll('img[data-kumify-overlay="true"]');
        overlays.forEach(overlay => {
            overlay.style.opacity = enabled ? '1' : '0';
        });
    }
})();
