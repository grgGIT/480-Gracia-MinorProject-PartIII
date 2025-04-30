// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get UI elements
    const resetButton = document.getElementById('resetButton');
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Target coordinates
    const TARGET_LATITUDE = 43.078861;
    const TARGET_LONGITUDE = -77.671736;
    
    // Handle reset button click
    resetButton.addEventListener('click', function() {
        // Get the camera and model elements
        const camera = document.querySelector('a-camera');
        const model = document.querySelector('[gps-entity-place]');
        
        if (camera && model) {
            // Reset the model position relative to the camera
            const cameraPosition = camera.getAttribute('position');
            model.setAttribute('position', {
                x: cameraPosition.x,
                y: cameraPosition.y - 1, // Place slightly below camera
                z: cameraPosition.z - 3  // Place 3 units in front of camera
            });
            
            console.log('Model position reset');
        }
    });
    
    // Function to calculate distance between two GPS coordinates in meters
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
    
    // Check user's distance from target location
    function checkLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                
                const distance = calculateDistance(
                    userLat, userLon,
                    TARGET_LATITUDE, TARGET_LONGITUDE
                );
                
                console.log(`Distance to target: ${distance.toFixed(2)} meters`);
                
                // Provide feedback based on distance
                if (distance > 100) {
                    alert(`You are ${distance.toFixed(0)} meters away from the AR experience location. Please move closer for the best experience.`);
                }
            }, function(error) {
                console.error('Error getting location:', error);
            });
        }
    }
    
    // Check location when the AR experience starts
    window.addEventListener('arjs-video-loaded', function() {
        loadingScreen.style.display = 'none';
        checkLocation();
    });
    
    // Handle model loading errors
    document.querySelector('[gltf-model]').addEventListener('model-error', function(event) {
        console.error('Error loading 3D model:', event);
        alert('Failed to load 3D model. Please check if the file exists and try again.');
    });
    
    // Add debug information for development
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function() {
        console.log('A-Frame scene loaded');
    });
    
    scene.addEventListener('arjs-nft-loaded', function() {
        console.log('AR.js initialized');
    });
});