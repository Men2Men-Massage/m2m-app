/**
 * Utility functions for the M2M Payment Calculator
 */

/**
 * Format a date as YYYY-MM-DD
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if the device is running iOS
 * @returns True if the device is iOS
 */
export function isIos(): boolean {
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
}

/**
 * Check if the web app is running in standalone mode
 * @returns True if the app is in standalone mode
 */
export function isInStandaloneMode(): boolean {
  return ('standalone' in window.navigator) && (window.navigator as any).standalone;
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when copying is done
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  } catch (err) {
    console.error('Failed to copy: ', err);
    alert('Failed to copy text. Please copy manually.');
  }
}

/**
 * Create a ripple effect for a button
 * @param event Click event
 */
export function createRipple(event: MouseEvent): void {
  const button = event.currentTarget as HTMLElement;

  // Remove any existing ripples before adding a new one
  const ripples = button.getElementsByClassName("ripple");
  while (ripples.length > 0) {
    ripples[0].remove();
  }

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  // Calculate click position relative to the element
  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left - radius;
  const y = event.clientY - rect.top - radius;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.classList.add("ripple");

  button.appendChild(circle);

  // Remove the ripple after animation
  setTimeout(() => {
    circle.remove();
  }, 600);
}

/**
 * Validate an email address
 * @param email Email to validate
 * @returns True if the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true; // Email vuota è considerata valida (dato che è opzionale)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Store locations
export interface StoreLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
}

// Store locations
export const STORE_LOCATIONS: StoreLocation[] = [
  {
    name: 'Nollendorfstrasse',
    address: 'Nollendorfstrasse 24, 10777 Berlin',
    latitude: 52.4974681,
    longitude: 13.3540543,
    radius: 1 // 1 kilometer radius
  },
  {
    name: 'Milastrasse',
    address: 'Milastrasse 7, 10437 Berlin',
    latitude: 52.5428109,
    longitude: 13.4128578,
    radius: 1 // 1 kilometer radius
  }
];

// Key for storing geolocation permission status
const GEOLOCATION_PERMISSION_KEY = 'm2m_geolocation_permission';

/**
 * Show geolocation information overlay
 * @returns Promise that resolves when the user grants or denies permission
 */
export function showGeolocationInfoOverlay(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if the user has already granted permission
    const permissionStatus = localStorage.getItem(GEOLOCATION_PERMISSION_KEY);
    if (permissionStatus === 'granted') {
      resolve(true);
      return;
    } else if (permissionStatus === 'denied') {
      resolve(false);
      return;
    }
    
    // Create overlay if it doesn't exist
    if (!document.getElementById('geolocation-info-overlay')) {
      const overlayHTML = `
        <div id="geolocation-info-overlay">
          <div class="geolocation-info-content">
            <div class="info-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <h2>Location Access</h2>
            <p>M2M Payment Calculator needs to check your location to show shift checklists when you're at the shop.</p>
            <p>Your location is <span class="highlight">only checked during shift change times</span> and is <span class="highlight">never stored or shared</span>.</p>
            <div class="geolocation-buttons">
              <button class="allow-button">Allow Location</button>
              <button class="deny-button">No Thanks</button>
            </div>
          </div>
        </div>
      `;
      
      const overlayContainer = document.createElement('div');
      overlayContainer.innerHTML = overlayHTML;
      document.body.appendChild(overlayContainer.firstElementChild as Node);
      
      // Add event listeners to buttons
      const allowButton = document.querySelector('.allow-button') as HTMLButtonElement;
      const denyButton = document.querySelector('.deny-button') as HTMLButtonElement;
      
      if (allowButton) {
        allowButton.addEventListener('click', () => {
          localStorage.setItem(GEOLOCATION_PERMISSION_KEY, 'granted');
          removeOverlay();
          resolve(true);
        });
      }
      
      if (denyButton) {
        denyButton.addEventListener('click', () => {
          localStorage.setItem(GEOLOCATION_PERMISSION_KEY, 'denied');
          removeOverlay();
          resolve(false);
        });
      }
    } else {
      document.getElementById('geolocation-info-overlay')!.style.display = 'flex';
    }
    
    // Function to remove overlay
    function removeOverlay() {
      const overlay = document.getElementById('geolocation-info-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }
  });
}

/**
 * Get the current geolocation position
 * @returns Promise with the current position
 */
export async function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise(async (resolve, reject) => {
    // Show overlay and get user permission
    const userConsent = await showGeolocationInfoOverlay();
    
    if (!userConsent) {
      reject(new Error('User denied geolocation permission.'));
      return;
    }
    
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 5 * 60 * 1000 // Accept 5-minute-old positions
      }
    );
  });
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

/**
 * Convert degrees to radians
 * @param deg Degrees
 * @returns Radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Check if the current location is near any of the stores
 * @param latitude Current latitude
 * @param longitude Current longitude
 * @returns Promise that resolves to true if near a store, false otherwise
 */
export async function isNearStore(latitude: number, longitude: number): Promise<boolean> {
  // Check if the user has denied permission
  const permissionStatus = localStorage.getItem(GEOLOCATION_PERMISSION_KEY);
  if (permissionStatus === 'denied') {
    // If user denied permission, assume they're at a store to avoid breaking functionality
    console.log('User denied geolocation permission, assuming at store');
    return true;
  }
  
  // Check if the current location is within the radius of any store
  for (const store of STORE_LOCATIONS) {
    const distance = calculateDistance(
      latitude,
      longitude,
      store.latitude,
      store.longitude
    );
    
    console.log(`Distance to ${store.name}: ${distance.toFixed(2)} km`);
    
    if (distance <= store.radius) {
      console.log(`User is near ${store.name}`);
      return true;
    }
  }
  
  console.log('User is not near any store');
  return false;
}
