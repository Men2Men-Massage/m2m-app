import { UserData } from '../types';
import { StorageService, AUTH_CODE } from '../utils/storage-service';

/**
 * Authentication module for the application
 */
export class AuthModule {
  private authOverlay: HTMLElement;
  private codeSection: HTMLElement;
  private nameSection: HTMLElement;
  private userNameInput: HTMLInputElement;
  private userEmailInput: HTMLInputElement;
  private profileImagePreview: HTMLElement;
  private profileImageInput: HTMLInputElement;
  private navBar: HTMLElement;
  private onAuthenticated: (userData: UserData) => void;
  
  /**
   * Create an instance of the authentication module
   * @param onAuthenticated Callback when user is authenticated
   */
  constructor(onAuthenticated: (userData: UserData) => void) {
    this.authOverlay = document.getElementById('auth-overlay') as HTMLElement;
    this.codeSection = document.getElementById('code-section') as HTMLElement;
    this.nameSection = document.getElementById('name-section') as HTMLElement;
    this.userNameInput = document.getElementById('user-name-input') as HTMLInputElement;
    this.userEmailInput = document.getElementById('user-email-input') as HTMLInputElement;
    this.profileImagePreview = document.getElementById('profile-image-preview') as HTMLElement;
    this.profileImageInput = document.getElementById('profile-image-input') as HTMLInputElement;
    this.navBar = document.querySelector('.bottom-nav') as HTMLElement;
    this.onAuthenticated = onAuthenticated;
    
    this.initEventListeners();
  }
  
  /**
   * Initialize event listeners for the authentication UI
   */
  private initEventListeners(): void {
    // Code verification
    const accessCodeInput = document.getElementById('access-code') as HTMLInputElement;
    const checkCodeButton = accessCodeInput.nextElementSibling as HTMLButtonElement;
    
    checkCodeButton.addEventListener('click', () => this.checkCode());
    accessCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.checkCode();
    });
    
    // Profile image preview
    this.profileImageInput.addEventListener('change', (e) => this.previewProfileImage(e));
    
    // Select image button
    const selectImageBtn = document.getElementById('select-image-btn') as HTMLButtonElement;
    selectImageBtn.addEventListener('click', () => {
      this.profileImageInput.click();
    });
    
    // Save profile button
    const saveProfileButton = this.nameSection.querySelector('button:last-child') as HTMLButtonElement;
    saveProfileButton.addEventListener('click', () => this.saveUserProfile());
  }
  
  /**
   * Check authentication status
   * @returns True if authenticated
   */
  public checkAuth(): boolean {
    const isAuth = StorageService.isAuthenticated();
    const userData = StorageService.getUserData();
    
    if (isAuth && userData.name) {
      this.onAuthenticated(userData);
      return true;
    }
    
    this.showAuthOverlay();
    
    // Reset to code section on new auth
    this.nameSection.style.display = 'none';
    this.codeSection.style.display = 'block';
    
    // Clear any existing values
    const accessCodeInput = document.getElementById('access-code') as HTMLInputElement;
    if (accessCodeInput) {
      accessCodeInput.value = '';
    }
    
    return false;
  }
  
  /**
   * Show the authentication overlay
   */
  private showAuthOverlay(): void {
    this.authOverlay.style.display = 'flex';
    this.navBar.style.display = 'none';
    
    // Ensure other elements are not visible
    const container = document.querySelector('.container') as HTMLElement;
    if (container) container.style.display = 'none';
    
    const historyPage = document.getElementById('history-page') as HTMLElement;
    if (historyPage) historyPage.style.display = 'none';
    
    const profilePage = document.getElementById('profile-page') as HTMLElement;
    if (profilePage) profilePage.style.display = 'none';
    
    const userNameEl = document.getElementById('user-name') as HTMLElement;
    if (userNameEl) userNameEl.style.display = 'none';
  }
  
  /**
   * Hide the authentication overlay
   */
  private hideAuthOverlay(): void {
    this.authOverlay.style.display = 'none';
    this.navBar.style.display = 'flex';
  }
  
  /**
   * Check the entered access code
   */
  private checkCode(): void {
    const codeInput = document.getElementById('access-code') as HTMLInputElement;
    
    if (codeInput.value === AUTH_CODE) {
      const userData = StorageService.getUserData();
      
      // If user has a profile, log them in
      if (userData.name) {
        StorageService.setAuthenticated();
        this.onAuthenticated(userData);
      } else {
        // Otherwise show profile creation form
        this.codeSection.style.display = 'none';
        this.nameSection.style.display = 'block';
      }
    } else {
      alert('Invalid access code');
    }
  }
  
  /**
   * Preview the profile image before saving
   */
  private previewProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Remove the icon and add the image
        this.profileImagePreview.innerHTML = `<img src="${e.target?.result}" alt="Profile Preview">`;
      };
      
      reader.readAsDataURL(input.files[0]);
    }
  }
  
  /**
   * Save the user profile
   */
  private saveUserProfile(): void {
    // Validation: name is required
    if (this.userNameInput.value.trim().length === 0) {
      alert('Please enter your name');
      return;
    }
    
    // Collect profile data
    const userData: UserData = {
      name: this.userNameInput.value.trim(),
      email: this.userEmailInput.value.trim(),
      // Save image if present
      profileImage: this.profileImagePreview.querySelector('img') 
        ? (this.profileImagePreview.querySelector('img') as HTMLImageElement).src 
        : null
    };
    
    // Save data to localStorage
    StorageService.setAuthenticated();
    StorageService.saveUserData(userData);
    
    // Show the app
    this.hideAuthOverlay();
    this.onAuthenticated(userData);
  }
}
