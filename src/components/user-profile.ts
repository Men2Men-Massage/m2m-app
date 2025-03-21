import { UserData, HolidayRequest } from '../types';
import { StorageService } from '../utils/storage-service';
import { isValidEmail } from '../utils/helpers';

/**
 * User Profile Module
 */
export class UserProfile {
  private profilePage: HTMLElement;
  private profileNameEl: HTMLElement;
  private profileEmailEl: HTMLElement;
  private editNameInput: HTMLInputElement;
  private editEmailInput: HTMLInputElement;
  private profileImageLarge: HTMLElement;
  private deleteAccountModal: HTMLElement;
  
  // Holiday request elements
  private holidayStartDateInput: HTMLInputElement;
  private holidayEndDateInput: HTMLInputElement;
  private holidayNotesInput: HTMLTextAreaElement;
  private requestHolidayBtn: HTMLButtonElement;
  private holidayRequestSuccess: HTMLElement;
  private holidayRequestError: HTMLElement;
  
  /**
   * Create a UserProfile instance
   * @param onLogout Callback when user logs out
   */
  constructor(private onLogout: () => void, private onReturn: () => void) {
    this.profilePage = document.getElementById('profile-page') as HTMLElement;
    this.profileNameEl = document.getElementById('profile-name') as HTMLElement;
    this.profileEmailEl = document.getElementById('profile-email') as HTMLElement;
    this.editNameInput = document.getElementById('edit-name-input') as HTMLInputElement;
    this.editEmailInput = document.getElementById('edit-email-input') as HTMLInputElement;
    this.profileImageLarge = document.getElementById('profile-image-large') as HTMLElement;
    this.deleteAccountModal = document.getElementById('delete-account-modal') as HTMLElement;
    
    // Initialize holiday request elements
    this.holidayStartDateInput = document.getElementById('holiday-start-date') as HTMLInputElement;
    this.holidayEndDateInput = document.getElementById('holiday-end-date') as HTMLInputElement;
    this.holidayNotesInput = document.getElementById('holiday-notes') as HTMLTextAreaElement;
    this.requestHolidayBtn = document.querySelector('.request-holiday-btn') as HTMLButtonElement;
    this.holidayRequestSuccess = document.getElementById('holiday-request-success') as HTMLElement;
    this.holidayRequestError = document.getElementById('holiday-request-error') as HTMLElement;
    
    this.initEventListeners();
  }
  
  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Update profile button
    const updateProfileBtn = document.querySelector('.update-btn') as HTMLButtonElement;
    updateProfileBtn.addEventListener('click', () => this.updateUserProfile());
    
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn') as HTMLButtonElement;
    logoutBtn.addEventListener('click', () => this.logout());
    
    // Delete account button
    const deleteAccountBtn = document.querySelector('.delete-account-btn') as HTMLButtonElement;
    deleteAccountBtn.addEventListener('click', () => this.confirmDeleteAccount());
    
    // Delete account confirmation
    const confirmDeleteBtn = document.querySelector('.delete-confirm-btn') as HTMLButtonElement;
    confirmDeleteBtn.addEventListener('click', () => this.deleteAccount());
    
    // Cancel delete
    const cancelDeleteBtn = document.querySelector('.cancel-btn') as HTMLButtonElement;
    cancelDeleteBtn.addEventListener('click', () => {
      this.deleteAccountModal.style.display = 'none';
    });
    
    // Profile image update
    const changePhotoBtn = document.getElementById('change-photo-btn') as HTMLElement;
    const profileImageUpdateInput = document.getElementById('profile-image-update-input') as HTMLInputElement;
    
    changePhotoBtn.addEventListener('click', () => {
      profileImageUpdateInput.click();
    });
    
    profileImageUpdateInput.addEventListener('change', (e) => this.updateProfileImage(e));
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === this.deleteAccountModal) {
        this.deleteAccountModal.style.display = 'none';
      }
    });
    
    // Email validation
    this.editEmailInput.addEventListener('input', () => {
      const email = this.editEmailInput.value.trim();
      if (email && !isValidEmail(email)) {
        this.editEmailInput.setCustomValidity('Please enter a valid email address');
      } else {
        this.editEmailInput.setCustomValidity('');
      }
    });
    
    // Scheduled Shifts button
    const scheduledShiftsBtn = document.getElementById('scheduled-shifts-btn') as HTMLButtonElement;
    if (scheduledShiftsBtn) {
      scheduledShiftsBtn.addEventListener('click', () => {
        window.open('https://partners.fresha.com/reports/table/scheduled-shifts?shortcut=next_30_days', '_blank');
      });
    }
    
    // Reviews button
    const reviewsBtn = document.getElementById('reviews-btn') as HTMLButtonElement;
    if (reviewsBtn) {
      reviewsBtn.addEventListener('click', () => {
        window.open('https://partners.fresha.com/user-account/reviews', '_blank');
      });
    }
    
    // Initialize Holiday Request event listeners
    this.initHolidayRequestEventListeners();
  }
  
  /**
   * Initialize holiday request event listeners
   */
  private initHolidayRequestEventListeners(): void {
    if (!this.holidayStartDateInput || !this.holidayEndDateInput || !this.requestHolidayBtn) {
      console.error('Holiday request elements not found');
      return;
    }
    
    // Set minimum date (31 days from now)
    this.setMinimumHolidayDate();
    
    // Date change validation
    this.holidayStartDateInput.addEventListener('change', () => {
      // Update end date min value when start date changes
      if (this.holidayStartDateInput.value) {
        this.holidayEndDateInput.min = this.holidayStartDateInput.value;
      }
      this.validateHolidayDates();
    });
    
    this.holidayEndDateInput.addEventListener('change', () => {
      this.validateHolidayDates();
    });
    
    // Submit holiday request
    this.requestHolidayBtn.addEventListener('click', () => {
      this.sendHolidayRequest();
    });
  }
  
  /**
   * Set the minimum date for holiday requests (31 days from now)
   */
  private setMinimumHolidayDate(): void {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 31); // 31 days in the future
    
    const minDateStr = minDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    if (this.holidayStartDateInput) {
      this.holidayStartDateInput.min = minDateStr;
      
      // Set a placeholder that shows the minimum date
      const minDateDisplay = minDate.toLocaleDateString('en-GB');
      this.holidayStartDateInput.placeholder = `Min: ${minDateDisplay}`;
    }
    
    if (this.holidayEndDateInput) {
      this.holidayEndDateInput.min = minDateStr;
    }
  }
  
  /**
   * Validate the selected holiday dates
   */
  private validateHolidayDates(): void {
    if (!this.holidayStartDateInput || !this.holidayEndDateInput || !this.holidayRequestError || !this.requestHolidayBtn) {
      return;
    }
    
    const startDate = this.holidayStartDateInput.value;
    const endDate = this.holidayEndDateInput.value;
    
    // Hide previous error messages
    this.holidayRequestError.style.display = 'none';
    
    // If both dates are selected
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Check if end date is before start date
      if (endDateObj < startDateObj) {
        this.holidayRequestError.textContent = 'End date cannot be before start date';
        this.holidayRequestError.style.display = 'block';
        this.requestHolidayBtn.disabled = true;
        return;
      }
      
      // Check if start date is at least 31 days in the future
      const today = new Date();
      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() + 31);
      
      if (startDateObj < minDate) {
        this.holidayRequestError.textContent = 'Holiday requests must be made at least 31 days in advance';
        this.holidayRequestError.style.display = 'block';
        this.requestHolidayBtn.disabled = true;
        return;
      }
    }
    
    // If all validations pass, enable the button
    this.requestHolidayBtn.disabled = false;
  }
  
  /**
   * Send holiday request
   */
  private async sendHolidayRequest(): Promise<void> {
    if (!this.holidayStartDateInput || !this.holidayEndDateInput) {
      return;
    }
    
    const startDate = this.holidayStartDateInput.value;
    const endDate = this.holidayEndDateInput.value;
    const notes = this.holidayNotesInput.value.trim();
    
    // Basic validation
    if (!startDate || !endDate) {
      this.holidayRequestError.textContent = 'Please select both start and end dates';
      this.holidayRequestError.style.display = 'block';
      return;
    }
    
    // Disable button while sending
    this.requestHolidayBtn.disabled = true;
    this.requestHolidayBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
      // Get user data
      const userData = StorageService.getUserData();
      
      // Create request payload
      const holidayRequest: HolidayRequest = {
        userName: userData.name,
        userEmail: userData.email || '',
        startDate,
        endDate,
        notes: notes || undefined
      };
      
      // Send API request
      const response = await fetch('/api/send-holiday-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holidayRequest)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send holiday request');
      }
      
      // Show success message
      this.holidayRequestSuccess.style.display = 'block';
      this.holidayRequestError.style.display = 'none';
      
      // Reset form
      this.holidayStartDateInput.value = '';
      this.holidayEndDateInput.value = '';
      this.holidayNotesInput.value = '';
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        this.holidayRequestSuccess.style.display = 'none';
      }, 3000);
    } catch (error) {
      // Show error message
      this.holidayRequestError.textContent = (error as Error).message;
      this.holidayRequestError.style.display = 'block';
      this.holidayRequestSuccess.style.display = 'none';
    } finally {
      // Re-enable button
      this.requestHolidayBtn.disabled = false;
      this.requestHolidayBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Request Holiday';
      
      // Reset validation
      this.setMinimumHolidayDate();
    }
  }
  
  /**
   * Update profile with data
   */
  public updateProfile(userData: UserData): void {
    this.profileNameEl.textContent = userData.name || '';
    this.profileEmailEl.textContent = userData.email || 'Not provided';
    this.editNameInput.value = userData.name || '';
    this.editEmailInput.value = userData.email || '';
    
    // Update profile image if present
    if (userData.profileImage) {
      this.profileImageLarge.innerHTML = `<img src="${userData.profileImage}" alt="Profile Image">`;
    } else {
      this.profileImageLarge.innerHTML = '<i class="fas fa-user"></i>';
    }
  }
  
  /**
   * Show profile page
   */
  public showProfile(): void {
    this.profilePage.style.display = 'block';
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Update with latest data
    const userData = StorageService.getUserData();
    this.updateProfile(userData);
    
    // Reset holiday request form and validation
    if (this.holidayStartDateInput && this.holidayEndDateInput && this.holidayNotesInput) {
      this.holidayStartDateInput.value = '';
      this.holidayEndDateInput.value = '';
      this.holidayNotesInput.value = '';
      this.holidayRequestSuccess.style.display = 'none';
      this.holidayRequestError.style.display = 'none';
      this.setMinimumHolidayDate();
    }
  }
  
  /**
   * Hide profile page
   */
  public hideProfile(): void {
    this.profilePage.style.display = 'none';
  }
  
  /**
   * Update profile image
   */
  private updateProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Update profile image
        this.profileImageLarge.innerHTML = `<img src="${e.target?.result}" alt="Profile Image">`;
        
        // Update user data in localStorage
        const userData = StorageService.getUserData();
        userData.profileImage = e.target?.result as string;
        StorageService.saveUserData(userData);
      };
      
      reader.readAsDataURL(input.files[0]);
    }
  }
  
  /**
   * Update user profile
   */
  private updateUserProfile(): void {
    // Validation: name is required
    if (this.editNameInput.value.trim().length === 0) {
      alert('Please enter your name');
      return;
    }
    
    // Email validation
    const email = this.editEmailInput.value.trim();
    if (email && !isValidEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Collect profile data
    const userData = StorageService.getUserData();
    userData.name = this.editNameInput.value.trim();
    userData.email = email;
    
    // Save data to localStorage
    StorageService.saveUserData(userData);
    
    // Update display
    this.profileNameEl.textContent = userData.name;
    this.profileEmailEl.textContent = userData.email || 'Not provided';
    
    // Update user name in header
    const userNameEl = document.getElementById('user-name') as HTMLElement;
    userNameEl.textContent = `Hello ${userData.name}`;
    
    // Show confirmation
    alert('Profile updated successfully!');
    
    // Return to main page
    this.onReturn();
  }
  
  /**
   * Confirm account deletion
   */
  private confirmDeleteAccount(): void {
    this.deleteAccountModal.style.display = 'flex';
  }
  
  /**
   * Delete account
   */
  private deleteAccount(): void {
    // Delete all user data
    StorageService.clearAllData();
    
    // Also reset auth form fields to ensure they're empty
    this.resetAuthFormFields();
    
    // Close confirmation modal
    this.deleteAccountModal.style.display = 'none';
    
    alert('Your account has been deleted successfully');
    
    // Hide all app UI elements
    this.hideAllAppElements();
    
    // Redirect to login
    this.onLogout();
  }
  
  /**
   * Reset authentication form fields
   */
  private resetAuthFormFields(): void {
    // Reset access code input
    const accessCodeInput = document.getElementById('access-code') as HTMLInputElement;
    if (accessCodeInput) {
      accessCodeInput.value = '';
    }
    
    // Reset name, email inputs in the create profile section
    const userNameInput = document.getElementById('user-name-input') as HTMLInputElement;
    if (userNameInput) {
      userNameInput.value = '';
    }
    
    const userEmailInput = document.getElementById('user-email-input') as HTMLInputElement;
    if (userEmailInput) {
      userEmailInput.value = '';
    }
    
    // Reset profile image preview to default icon
    const profileImagePreview = document.getElementById('profile-image-preview') as HTMLElement;
    if (profileImagePreview) {
      profileImagePreview.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    // Reset profile image input
    const profileImageInput = document.getElementById('profile-image-input') as HTMLInputElement;
    if (profileImageInput) {
      profileImageInput.value = '';
    }
  }
  
  /**
   * Logout user
   */
  private logout(): void {
    StorageService.clearAuthentication();
    
    // Reset the access code input
    const accessCodeInput = document.getElementById('access-code') as HTMLInputElement;
    if (accessCodeInput) {
      accessCodeInput.value = '';
    }
    
    // Hide all app UI elements
    this.hideAllAppElements();
    
    this.onLogout();
  }
  
  /**
   * Hide all app UI elements
   */
  private hideAllAppElements(): void {
    // Hide navigation bar
    const navBar = document.querySelector('.bottom-nav') as HTMLElement;
    if (navBar) {
      navBar.style.display = 'none';
    }
    
    // Hide main container
    const container = document.querySelector('.container') as HTMLElement;
    if (container) {
      container.style.display = 'none';
    }
    
    // Hide history page
    const historyPage = document.getElementById('history-page') as HTMLElement;
    if (historyPage) {
      historyPage.style.display = 'none';
    }
    
    // Hide profile page
    if (this.profilePage) {
      this.profilePage.style.display = 'none';
    }
    
    // Hide user name element
    const userNameEl = document.getElementById('user-name') as HTMLElement;
    if (userNameEl) {
      userNameEl.style.display = 'none';
    }
    
    // Hide banners
    const androidBanner = document.getElementById('android-banner') as HTMLElement;
    if (androidBanner) {
      androidBanner.style.display = 'none';
    }
    
    const iosBanner = document.getElementById('ios-banner') as HTMLElement;
    if (iosBanner) {
      iosBanner.style.display = 'none';
    }
  }
}
