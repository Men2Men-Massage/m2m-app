import { UserData } from '../types';
import { StorageService } from '../utils/storage-service';

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
    const profileImageUpdateInput = document.getElementById('profile-image-update-input') as HTMLInputElement;
    profileImageUpdateInput.addEventListener('change', (e) => this.updateProfileImage(e));
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === this.deleteAccountModal) {
        this.deleteAccountModal.style.display = 'none';
      }
    });
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
    
    // Update with latest data
    const userData = StorageService.getUserData();
    this.updateProfile(userData);
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
    
    // Collect profile data
    const userData = StorageService.getUserData();
    userData.name = this.editNameInput.value.trim();
    userData.email = this.editEmailInput.value.trim();
    
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
    
    // Close confirmation modal
    this.deleteAccountModal.style.display = 'none';
    
    alert('Your account has been deleted successfully');
    
    // Redirect to login
    this.onLogout();
  }
  
  /**
   * Logout user
   */
  private logout(): void {
    StorageService.clearAuthentication();
    this.onLogout();
  }
}
