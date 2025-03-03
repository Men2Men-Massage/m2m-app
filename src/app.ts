import { UserData } from './types';
import { StorageService } from './utils/storage-service';
import { createRipple, isIos, isInStandaloneMode } from './utils/helpers';
import { AuthModule } from './components/auth';
import { PaymentCalculator } from './components/payment-calculator';
import { PaymentHistory } from './components/payment-history';
import { UserProfile } from './components/user-profile';
import { UtilityCalculator } from './components/utility-calculator';

/**
 * Main Application Class
 */
class App {
  private container: HTMLElement;
  private historyPage: HTMLElement;
  private profilePage: HTMLElement;
  private userNameEl: HTMLElement;
  private navItems: NodeListOf<Element>;
  
  private authModule: AuthModule;
  private paymentCalculator: PaymentCalculator;
  private paymentHistory: PaymentHistory;
  private userProfile: UserProfile;
  private utilityCalculator: UtilityCalculator;
  
  /**
   * Initialize the application
   */
  constructor() {
    // Main containers
    this.container = document.querySelector('.container') as HTMLElement;
    this.historyPage = document.getElementById('history-page') as HTMLElement;
    this.profilePage = document.getElementById('profile-page') as HTMLElement;
    this.userNameEl = document.getElementById('user-name') as HTMLElement;
    this.navItems = document.querySelectorAll('.nav-item');
    
    // Initialize modules
    this.authModule = new AuthModule(this.onAuthenticated.bind(this));
    this.paymentCalculator = new PaymentCalculator();
    this.paymentHistory = new PaymentHistory();
    this.userProfile = new UserProfile(
      this.handleLogout.bind(this),
      this.showCalculator.bind(this)
    );
    this.utilityCalculator = new UtilityCalculator();
    
    this.initEventListeners();
    this.checkAuthentication();
    this.registerServiceWorker();
  }
  
  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Navigation
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        createRipple(e as MouseEvent);
        this.handleNavigation(e.currentTarget as HTMLElement);
      });
    });
    
    // User profile button
    this.userNameEl.addEventListener('click', () => this.showUserProfile());
    
    // Fresha button
    const freshaBtn = document.getElementById('fresha-btn') as HTMLElement;
    freshaBtn.addEventListener('click', () => {
      window.open('https://partners.fresha.com/reports/table/appointment-summary?appointment_status=unconfirmed%2Cconfirmed%2Carrived%2Cstarted%2Ccompleted&shortcut=today', '_blank');
    });
    
    // Instructions toggle
    this.initInstructionsToggle();
  }
  
  /**
   * Initialize instructions toggle
   */
  private initInstructionsToggle(): void {
    const toggleBtn = document.getElementById('toggle-instructions-btn') as HTMLElement;
    const instructionsContent = document.getElementById('instructions-content') as HTMLElement;
    const instructionsContainer = document.querySelector('.instructions-container') as HTMLElement;

    // Initial state: instructions visible
    instructionsContent.classList.remove('collapsed');
    instructionsContainer.classList.remove('collapsed');
    toggleBtn.textContent = 'Hide';

    toggleBtn.addEventListener('click', () => {
      instructionsContent.classList.toggle('collapsed');
      instructionsContainer.classList.toggle('collapsed');
      toggleBtn.textContent = instructionsContent.classList.contains('collapsed') ? 'Show' : 'Hide';
    });
  }
  
  /**
   * Check authentication status
   */
  private checkAuthentication(): void {
    this.authModule.checkAuth();
  }
  
  /**
   * Handle authenticated user
   */
  private onAuthenticated(userData: UserData): void {
    this.container.style.display = 'block';
    this.userNameEl.textContent = `Hello ${userData.name}`;
    this.userNameEl.style.display = 'block';
    
    // Show navigation bar - Fix: Cast to HTMLElement
    const navBar = document.querySelector('.bottom-nav') as HTMLElement;
    if (navBar) {
      navBar.style.display = 'flex';
    }
    
    // Set home tab as active
    const homeNav = document.getElementById('home-nav') as HTMLElement;
    if (homeNav) {
      homeNav.classList.add('active');
    }
    
    this.showInstallBanners();
  }
  
  /**
   * Handle navigation between tabs
   */
  private handleNavigation(target: HTMLElement): void {
    // Remove active class from all navigation items
    this.navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to clicked item
    target.classList.add('active');
    
    // Handle view change based on id
    if (target.id === 'home-nav') {
      this.showCalculator();
    } else if (target.id === 'history-nav') {
      this.showPaymentHistory();
    }
  }
  
  /**
   * Show calculator view
   */
  public showCalculator(): void {
    this.container.style.display = 'block';
    this.historyPage.style.display = 'none';
    this.profilePage.style.display = 'none';
    
    // Set home tab as active
    const homeNav = document.getElementById('home-nav') as HTMLElement;
    if (homeNav) {
      homeNav.classList.add('active');
      this.navItems.forEach(item => {
        if (item.id !== 'home-nav') {
          item.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * Show payment history view
   */
  public showPaymentHistory(): void {
    this.container.style.display = 'none';
    this.profilePage.style.display = 'none';
    this.paymentHistory.showPaymentHistory();
    
    // Set history tab as active
    const historyNav = document.getElementById('history-nav') as HTMLElement;
    if (historyNav) {
      historyNav.classList.add('active');
      this.navItems.forEach(item => {
        if (item.id !== 'history-nav') {
          item.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * Show user profile view
   */
  public showUserProfile(): void {
    this.container.style.display = 'none';
    this.historyPage.style.display = 'none';
    this.userProfile.showProfile();
    
    // Deselect all tabs
    this.navItems.forEach(item => item.classList.remove('active'));
  }
  
  /**
   * Handle logout
   */
  private handleLogout(): void {
    this.container.style.display = 'none';
    this.userNameEl.style.display = 'none';
    this.historyPage.style.display = 'none';
    this.profilePage.style.display = 'none';
    
    // Hide navigation bar - Fix: Cast to HTMLElement
    const navBar = document.querySelector('.bottom-nav') as HTMLElement;
    if (navBar) {
      navBar.style.display = 'none';
    }
    
    this.checkAuthentication();
  }
  
  /**
   * Show install banners for PWA
   */
  private showInstallBanners(): void {
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      if (!window.matchMedia('(display-mode: standalone)').matches) {
        const androidBanner = document.getElementById('android-banner') as HTMLElement;
        if (androidBanner) {
          androidBanner.style.display = 'flex';
        }
      }
    });

    const installButton = document.getElementById('install-button') as HTMLElement;
    if (installButton) {
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            const androidBanner = document.getElementById('android-banner') as HTMLElement;
            if (androidBanner) {
              androidBanner.style.display = 'none';
            }
          }
          deferredPrompt = null;
        }
      });
    }

    if (isIos() && !isInStandaloneMode()) {
      const iosBanner = document.getElementById('ios-banner') as HTMLElement;
      if (iosBanner) {
        iosBanner.style.display = 'flex';
      }
    }
  }
  
  /**
   * Register service worker for PWA
   */
  private registerServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
