import { UserData } from '../types';
import { StorageService, AUTH_CODE } from '../utils/storage-service';
import { isValidEmail, isIos, isInStandaloneMode } from '../utils/helpers';

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
  private iosPreLoginBanner: HTMLElement | null;
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
    this.iosPreLoginBanner = document.getElementById('ios-pre-login-banner');
    this.onAuthenticated = onAuthenticated;
    
    this.initEventListeners();
    this.checkIOSPreLoginBanner();
  }
  
  /**
   * Check if we should show the iOS pre-login banner
   */
  private checkIOSPreLoginBanner(): void {
    // Only show on iOS devices that are not in standalone mode
    if (this.iosPreLoginBanner && isIos() && !isInStandaloneMode()) {
      // Check if banner was dismissed before
      const bannerDismissed = sessionStorage.getItem('preLoginBannerDismissed') === 'true';
      
      if (!bannerDismissed) {
        this.iosPreLoginBanner.style.display = 'block';
      }
    }
  }
  
  /**
   * Initialize event listeners for the authentication UI
   */
  public initEventListeners(): void {
    // Code verification
    const accessCodeInput = document.getElementById('access-code') as HTMLInputElement;
    const checkCodeButton = this.codeSection.querySelector('button') as HTMLButtonElement;
    
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

    // Email validation for "Create Profile" screen
    this.userEmailInput.addEventListener('input', () => {
      const email = this.userEmailInput.value.trim();
      if (email && !isValidEmail(email)) {
        this.userEmailInput.setCustomValidity('Please enter a valid email address');
      } else {
        this.userEmailInput.setCustomValidity('');
      }
    });
    
    // Close iOS pre-login banner
    const closePreLoginBanner = document.querySelector('.close-pre-login-banner');
    if (closePreLoginBanner) {
      closePreLoginBanner.addEventListener('click', () => {
        if (this.iosPreLoginBanner) {
          this.iosPreLoginBanner.style.display = 'none';
          // Remember that the banner was dismissed
          sessionStorage.setItem('preLoginBannerDismissed', 'true');
        }
      });
    }
  }
  
  /**
   * Check authentication status
   * @returns True if authenticated
   */
  public checkAuth(): boolean {
    const isAuth = StorageService.isAuthenticated();
    const userData = StorageService.getUserData();
    
    if (isAuth && userData.name) {
      // Ensure auth overlay is hidden if user is authenticated
      this.hideAuthOverlay();
      this.onAuthenticated(userData);
      return true;
    }
    
    this.showAuthOverlay();
    
    // Reset to code section on new auth
    this.nameSection.style.display = 'none';
    this.codeSection.style.display = 'block';
    
    // Check if we should show the iOS pre-login banner
    this.checkIOSPreLoginBanner();
    
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
    // Hide all app elements
    this.hideAppElements();
    
    // Show auth overlay
    this.authOverlay.style.display = 'flex';
  }
  
  /**
   * Hide all app elements
   */
  private hideAppElements(): void {
    // Hide navigation bar
    if (this.navBar) {
      this.navBar.style.display = 'none';
    }
    
    // Hide other app elements
    const container = document.querySelector('.container') as HTMLElement;
    if (container) container.style.display = 'none';
    
    const historyPage = document.getElementById('history-page') as HTMLElement;
    if (historyPage) historyPage.style.display = 'none';
    
    const profilePage = document.getElementById('profile-page') as HTMLElement;
    if (profilePage) profilePage.style.display = 'none';
    
    const userNameEl = document.getElementById('user-name') as HTMLElement;
    if (userNameEl) userNameEl.style.display = 'none';
    
    // Hide banners
    const androidBanner = document.getElementById('android-banner') as HTMLElement;
    if (androidBanner) androidBanner.style.display = 'none';
    
    const iosBanner = document.getElementById('ios-banner') as HTMLElement;
    if (iosBanner) iosBanner.style.display = 'none';
  }
  
  /**
   * Hide the authentication overlay
   */
  private hideAuthOverlay(): void {
    this.authOverlay.style.display = 'none';
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
        this.hideAuthOverlay();
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
    
    // Email validation
    const email = this.userEmailInput.value.trim();
    if (email && !isValidEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Collect profile data
    const userData: UserData = {
      name: this.userNameInput.value.trim(),
      email: email,
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
    
    // Reset scroll position
    window.scrollTo(0, 0);
  }
}
