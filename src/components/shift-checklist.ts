import { StorageService } from '../utils/storage-service';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export enum ChecklistType {
  Evening = 'evening', // 17:30-18:30
  Night = 'night'      // 23:30-00:30
}

/**
 * Shift Checklist Module
 */
export class ShiftChecklist {
  private checklistModal: HTMLElement | null = null;
  private checklistItems: HTMLElement | null = null;
  private checklistType: ChecklistType | null = null;
  
  // Checklists for different times
  private eveningChecklist: ChecklistItem[] = [
    { id: 'checkout', text: 'Checked out all appointments in Fresha', checked: false },
    { id: 'towels', text: 'Washed towels and put them to dry', checked: false },
    { id: 'dishwasher', text: 'Run the dishwasher', checked: false },
    { id: 'cleaning', text: 'Cleaned the apartment and left it tidy for colleagues', checked: false },
    { id: 'payment', text: 'Made instant bank transfer for rent payment', checked: false },
    { id: 'handover', text: 'Completed handover with colleague to communicate any information', checked: false }
  ];
  
  private nightChecklist: ChecklistItem[] = [
    { id: 'checkout', text: 'Checked out all appointments in Fresha', checked: false },
    { id: 'towels', text: 'Washed towels and put them to dry', checked: false },
    { id: 'dishwasher', text: 'Run the dishwasher', checked: false },
    { id: 'cleaning', text: 'Cleaned the apartment and left it tidy for colleagues', checked: false },
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
   * Check if checklist should be shown
   * @returns {boolean} True if checklist should be shown
   */
  public shouldShowChecklist(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes since midnight
    
    // Convert time ranges to minutes since midnight
    const eveningStartTime = 17 * 60 + 30; // 17:30
    const eveningEndTime = 18 * 60 + 30;   // 18:30
    const nightStartTime = 23 * 60 + 30;   // 23:30
    const nightEndTime = 0 * 60 + 30;      // 00:30 (next day)
    
    // Check if current time is within evening range
    if (currentTime >= eveningStartTime && currentTime <= eveningEndTime) {
      // Check if checklist was already shown today during evening time
      const lastShownDate = StorageService.getLastShownDate(ChecklistType.Evening);
      if (this.isSameDay(lastShownDate, now)) {
        return false;
      }
      
      this.checklistType = ChecklistType.Evening;
      return true;
    }
    
    // Check if current time is within night range (spanning midnight)
    if ((currentTime >= nightStartTime) || (currentTime <= nightEndTime)) {
      // Check if checklist was already shown today during night time
      const lastShownDate = StorageService.getLastShownDate(ChecklistType.Night);
      // If it's after midnight, compare with yesterday's date
      const compareDate = currentHour < 1 ? new Date(now.getTime() - 24 * 60 * 60 * 1000) : now;
      
      if (this.isSameDay(lastShownDate, compareDate)) {
        return false;
      }
      
      this.checklistType = ChecklistType.Night;
      return true;
    }
    
    return false;
  }
  
  /**
   * Show checklist modal
   */
  public showChecklist(): void {
    if (!this.checklistType || !this.checklistModal || !this.checklistItems) {
      return;
    }
    
    // Set title based on type
    const headerElement = this.checklistModal.querySelector('.checklist-header h2') as HTMLElement;
    if (headerElement) {
      headerElement.textContent = this.checklistType === ChecklistType.Evening ? 
        'Evening Shift Checklist' : 'Night Shift Checklist';
    }
    
    // Populate checklist items
    this.populateChecklist();
    
    // Show modal
    this.checklistModal.style.display = 'flex';
  }
  
  /**
   * Close checklist modal
   */
  private closeChecklist(): void {
    if (this.checklistModal) {
      this.checklistModal.style.display = 'none';
    }
  }
  
  /**
   * Populate checklist with items
   */
  private populateChecklist(): void {
    if (!this.checklistItems || !this.checklistType) return;
    
    // Clear existing items
    this.checklistItems.innerHTML = '';
    
    // Get appropriate checklist
    const items = this.checklistType === ChecklistType.Evening ? 
      this.eveningChecklist : this.nightChecklist;
    
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
    
    const items = this.checklistType === ChecklistType.Evening ? 
      this.eveningChecklist : this.nightChecklist;
    
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
