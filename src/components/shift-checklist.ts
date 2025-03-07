import { StorageService } from '../utils/storage-service';
import { getCurrentPosition, isNearStore } from '../utils/helpers';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export enum ChecklistType {
  Morning = 'morning',  // 10:45-12:15 (apertura)
  Evening = 'evening',  // 17:30-18:30
  Night = 'night'       // 23:30-00:30
}

/**
 * Shift Checklist Module
 */
export class ShiftChecklist {
  private checklistModal: HTMLElement | null = null;
  private checklistItems: HTMLElement | null = null;
  private checklistType: ChecklistType | null = null;
  private isCheckingLocation: boolean = false;
  private lastLocationCheck: Date | null = null;
  private lastKnownNearStore: boolean = false;
  
  // Morning checklist (opening 10:45-12:15)
  private morningChecklist: ChecklistItem[] = [
    { id: 'signs', text: 'Bring out the sign and bench', checked: false },
    { id: 'lights', text: 'Turn on all lights (Note: "Open" light works automatically, DO NOT turn it off)', checked: false },
    { id: 'massage-room', text: 'Set up massage room: oils, towels and essentials', checked: false },
    { id: 'table-height', text: 'Adjust massage table height to correct position', checked: false },
    { id: 'laundry', text: 'Check, fold, and change any laundry items', checked: false },
    { id: 'water', text: 'Change water in glasses or replace with clean ones', checked: false },
    { id: 'dishwasher', text: 'Check dishwasher: run and empty if needed', checked: false },
    { id: 'clean-floor', text: 'Run Roomba or vacuum floor (especially if dirty)', checked: false },
    { id: 'bathroom', text: 'Check and clean shower and toilet if necessary', checked: false },
    { id: 'candles', text: 'Charge candle batteries if low', checked: false },
    { id: 'ambiance', text: 'Ensure all candles and ambiance elements are properly set up', checked: false }
  ];
  
  // Evening checklist (17:30-18:30)
  private eveningChecklist: ChecklistItem[] = [
    { id: 'checkout', text: 'Checked out all appointments in Fresha', checked: false },
    { id: 'towels', text: 'Washed towels and put them to dry', checked: false },
    { id: 'dishwasher', text: 'Run the dishwasher', checked: false },
    { id: 'cleaning', text: 'Cleaned the store and left it tidy for colleagues', checked: false },
    { id: 'payment', text: 'Made instant bank transfer for rent payment', checked: false },
    { id: 'handover', text: 'Completed handover with colleague to communicate any information', checked: false }
  ];
  
  // Night checklist (23:30-00:30)
  private nightChecklist: ChecklistItem[] = [
    { id: 'checkout', text: 'Checked out all appointments in Fresha', checked: false },
    { id: 'towels', text: 'Washed towels and put them to dry', checked: false },
    { id: 'dishwasher', text: 'Run the dishwasher', checked: false },
    { id: 'cleaning', text: 'Cleaned the store and left it tidy for colleagues', checked: false },
    { id: 'payment', text: 'Made instant bank transfer for rent payment', checked: false },
    { id: 'lights', text: 'Turned off all lights, heating, moved bench and signs inside', checked: false },
    { id: 'lock', text: 'Locked the shop via Nuki app and verified it\'s locked', checked: false }
  ];
  
  /**
   * Create a ShiftChecklist instance
   */
  constructor() {
    // Create modal element if it doesn't exist
    this.createModalIfNotExists();
    
    this.checklistModal = document.getElementById('shift-checklist-modal');
    this.checklistItems = document.getElementById('checklist-items');
    
    this.initEventListeners();
  }
  
  /**
   * Create modal if it doesn't exist in the DOM
   */
  private createModalIfNotExists(): void {
    if (!document.getElementById('shift-checklist-modal')) {
      const modalHTML = `
        <div id="shift-checklist-modal" class="modal">
          <div class="checklist-modal-content">
            <div class="checklist-header">
              <h2>End of Shift Checklist</h2>
              <span class="close-checklist">&times;</span>
            </div>
            
            <div class="checklist-subheader">
              Please confirm you've completed all these tasks:
            </div>
            
            <div id="checklist-items" class="checklist-items">
              <!-- Checklist items will be inserted here -->
            </div>
            
            <div class="checklist-note">
              <p>Completing all tasks is essential for a smooth transition between shifts.</p>
            </div>
            
            <!-- Sticky action buttons container moved to the bottom -->
            <div class="checklist-actions">
              <button id="confirm-checklist-btn" class="confirm-checklist-btn">Confirm Completion</button>
              <button id="remind-later-btn" class="remind-later-btn">Remind Me Later</button>
            </div>
          </div>
        </div>
      `;
      
      // Append modal to body
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer.firstElementChild as Node);
    }
  }
  
  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    if (!this.checklistModal) return;
    
    // Close button
    const closeButton = this.checklistModal.querySelector('.close-checklist') as HTMLElement;
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeChecklist());
    }
    
    // Confirm button
    const confirmButton = document.getElementById('confirm-checklist-btn') as HTMLButtonElement;
    if (confirmButton) {
      confirmButton.addEventListener('click', () => this.confirmChecklist());
    }
    
    // Remind later button
    const remindLaterButton = document.getElementById('remind-later-btn') as HTMLButtonElement;
    if (remindLaterButton) {
      remindLaterButton.addEventListener('click', () => this.remindLater());
    }
    
    // Close when clicking outside the modal
    window.addEventListener('click', (event) => {
      if (event.target === this.checklistModal) {
        this.closeChecklist();
      }
    });
  }
  
  /**
   * Check if user is near a store using geolocation
   * @returns Promise<boolean> True if user is near a store, false otherwise
   */
  private async checkIfNearStore(): Promise<boolean> {
    // Prevent multiple location checks at the same time
    if (this.isCheckingLocation) {
      console.log('Already checking location, returning last known result');
      return this.lastKnownNearStore;
    }
    
    // If we checked the location in the last 5 minutes, use cached result
    const now = new Date();
    if (this.lastLocationCheck && 
        (now.getTime() - this.lastLocationCheck.getTime() < 5 * 60 * 1000)) {
      console.log('Using cached location check result');
      return this.lastKnownNearStore;
    }
    
    this.isCheckingLocation = true;
    
    try {
      console.log('Getting current position...');
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      console.log(`Position obtained: ${latitude}, ${longitude}`);
      
      // Check if near any store
      const nearStore = await isNearStore(latitude, longitude);
      
      // Update cache
      this.lastLocationCheck = new Date();
      this.lastKnownNearStore = nearStore;
      
      console.log(`User is ${nearStore ? 'near' : 'not near'} a store`);
      
      return nearStore;
    } catch (error) {
      console.error('Error getting location:', error);
      
      // If we can't get the location, assume the user is at the store
      // This prevents the checklist from not showing up due to location errors
      return true;
    } finally {
      this.isCheckingLocation = false;
    }
  }
  
  /**
   * Check if checklist should be shown
   * @returns {Promise<boolean>} True if checklist should be shown
   */
  public async shouldShowChecklist(): Promise<boolean> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes since midnight
    
    // Convert time ranges to minutes since midnight
    const morningStartTime = 10 * 60 + 45; // 10:45
    const morningEndTime = 12 * 60 + 15;   // 12:15
    const eveningStartTime = 17 * 60 + 30; // 17:30
    const eveningEndTime = 18 * 60 + 30;   // 18:30
    const nightStartTime = 23 * 60 + 30;   // 23:30
    const nightEndTime = 0 * 60 + 30;      // 00:30 (next day)
    
    // Check if time is within any of the ranges
    let isValidTime = false;
    
    // Check if current time is within morning range
    if (currentTime >= morningStartTime && currentTime <= morningEndTime) {
      this.checklistType = ChecklistType.Morning;
      isValidTime = true;
    }
    // Check if current time is within evening range
    else if (currentTime >= eveningStartTime && currentTime <= eveningEndTime) {
      this.checklistType = ChecklistType.Evening;
      isValidTime = true;
    }
    // Check if current time is within night range (spanning midnight)
    else if ((currentTime >= nightStartTime) || (currentTime <= nightEndTime)) {
      this.checklistType = ChecklistType.Night;
      isValidTime = true;
    }
    
    // If not in any time range, return false
    if (!isValidTime || !this.checklistType) {
      return false;
    }
    
    // Check if already shown today
    const lastShownDate = StorageService.getLastShownDate(this.checklistType);
    
    // For night checklist, if it's after midnight, compare with yesterday's date
    const compareDate = (this.checklistType === ChecklistType.Night && currentHour < 1) ?
      new Date(now.getTime() - 24 * 60 * 60 * 1000) : now;
    
    if (this.isSameDay(lastShownDate, compareDate)) {
      return false;
    }
    
    // Check if user is near a store
    const nearStore = await this.checkIfNearStore();
    if (!nearStore) {
      console.log('User is not near a store, not showing checklist.');
      return false;
    }
    
    // All conditions met, show checklist
    return true;
  }
  
  /**
   * Show a checklist manually (not based on time or location)
   * @param type Type of checklist to show
   */
  public showManualChecklist(type: ChecklistType): void {
    this.checklistType = type;
    this.showChecklist();
  }
  
  /**
   * Show checklist modal
   */
  public showChecklist(): void {
    if (!this.checklistType || !this.checklistModal || !this.checklistItems) {
      return;
    }
    
    // Reset all checklist items to unchecked based on type
    if (this.checklistType === ChecklistType.Morning) {
      this.morningChecklist.forEach(item => item.checked = false);
    } else if (this.checklistType === ChecklistType.Evening) {
      this.eveningChecklist.forEach(item => item.checked = false);
    } else {
      this.nightChecklist.forEach(item => item.checked = false);
    }
    
    // Set title based on type
    const headerElement = this.checklistModal.querySelector('.checklist-header h2') as HTMLElement;
    if (headerElement) {
      if (this.checklistType === ChecklistType.Morning) {
        headerElement.textContent = 'Opening Checklist';
      } else if (this.checklistType === ChecklistType.Evening) {
        headerElement.textContent = 'Evening Shift Checklist';
      } else {
        headerElement.textContent = 'Night Shift Checklist';
      }
    }
    
    // Populate checklist items
    this.populateChecklist();
    
    // Remove modale display:none e imposta display:flex
    this.checklistModal.style.display = 'flex';
    
    // Make sure modal is scrolled to the top when opened
    this.checklistModal.scrollTop = 0;
    
    // Ensure the body doesn't scroll while modal is open
    document.body.style.overflow = 'hidden';
    
    // Add extra handling for iOS devices which can have scroll issues
    if (typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add top position to simulate fixed positioning
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Store scroll position for later restoration
      this.checklistModal.dataset.scrollY = String(scrollY);
    }
  }
  
  /**
   * Close checklist modal
   */
  private closeChecklist(): void {
    if (this.checklistModal) {
      this.checklistModal.style.display = 'none';
      
      // Restore body scrolling
      document.body.style.overflow = '';
      
      // Special handling for iOS
      if (typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
        // Restore previous scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        const scrollY = this.checklistModal.dataset.scrollY || '0';
        window.scrollTo(0, parseInt(scrollY));
      }
    }
  }
  
  /**
   * Populate checklist with items
   */
  private populateChecklist(): void {
    if (!this.checklistItems || !this.checklistType) return;
    
    // Clear existing items
    this.checklistItems.innerHTML = '';
    
    // Get appropriate checklist based on type
    let items: ChecklistItem[];
    if (this.checklistType === ChecklistType.Morning) {
      items = this.morningChecklist;
    } else if (this.checklistType === ChecklistType.Evening) {
      items = this.eveningChecklist;
    } else {
      items = this.nightChecklist;
    }
    
    // Create checklist items
    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'checklist-item';
      
      itemElement.innerHTML = `
        <label class="checklist-label">
          <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''}>
          <span class="checkmark"></span>
          <span class="checklist-text">${item.text}</span>
        </label>
      `;
      
      // Add event listener for checkbox
      const checkbox = itemElement.querySelector('input') as HTMLInputElement;
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          item.checked = checkbox.checked;
          this.updateConfirmButtonState();
        });
      }
      
      this.checklistItems?.appendChild(itemElement);
    });
    
    // Update confirm button state
    this.updateConfirmButtonState();
  }
  
  /**
   * Update the state of the confirm button based on checklist completion
   */
  private updateConfirmButtonState(): void {
    if (!this.checklistType) return;
    
    const confirmButton = document.getElementById('confirm-checklist-btn') as HTMLButtonElement;
    if (!confirmButton) return;
    
    // Get appropriate checklist based on type
    let items: ChecklistItem[];
    if (this.checklistType === ChecklistType.Morning) {
      items = this.morningChecklist;
    } else if (this.checklistType === ChecklistType.Evening) {
      items = this.eveningChecklist;
    } else {
      items = this.nightChecklist;
    }
    
    // Check if all items are checked
    const allChecked = items.every(item => item.checked);
    
    // Enable/disable button
    confirmButton.disabled = !allChecked;
    
    // Update button text
    confirmButton.textContent = allChecked ? 'Confirm Completion' : 'Please Complete All Tasks';
  }
  
  /**
   * Confirm checklist completion
   */
  private confirmChecklist(): void {
    if (!this.checklistType) {
      return;
    }
    
    // Save the current date as last shown date
    StorageService.saveLastShownDate(this.checklistType);
    
    // Show confirmation message
    alert('Thank you for completing the checklist!');
    
    // Close modal
    this.closeChecklist();
  }
  
  /**
   * Remind later (will show again in 30 minutes)
   */
  private remindLater(): void {
    // Close modal without saving the date
    this.closeChecklist();
  }
  
  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date | null, date2: Date): boolean {
    if (!date1) {
      return false;
    }
    
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}
