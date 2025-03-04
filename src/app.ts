import { UserData } from './types';
import { StorageService } from './utils/storage-service';
import { createRipple, isIos, isInStandaloneMode } from './utils/helpers';
import { AuthModule } from './components/auth';
import { PaymentCalculator } from './components/payment-calculator';
import { PaymentHistory } from './components/payment-history';
import { UserProfile } from './components/user-profile';
import { UtilityCalculator } from './components/utility-calculator';
import { ChatbotModule } from './components/chatbot';

/**
 * Main Application Class
 */
class App {
  // Initialize properties with null
  private container: HTMLElement | null = null;
  private historyPage: HTMLElement | null = null;
  private profilePage: HTMLElement | null = null;
  private chatbotPage: HTMLElement | null = null;
  private userNameEl: HTMLElement | null = null;
  private navItems: NodeListOf<Element> | null = null;
  private androidBanner: HTMLElement | null = null;
  private iosBanner: HTMLElement | null = null;
  private navBar: HTMLElement | null = null;
  
  private authModule: AuthModule | null = null;
  private paymentCalculator: PaymentCalculator | null = null;
  private paymentHistory: PaymentHistory | null = null;
  private userProfile: UserProfile | null = null;
  private utilityCalculator: UtilityCalculator | null = null;
  private chatbotModule: ChatbotModule | null = null;
  
  /**
   * Initialize the application
   */
  constructor() {
    console.log('App constructor called');
    // Ensure the DOM is fully loaded
    if (typeof document !== 'undefined') {
      this.initializeApp();
    } else {
      console.error('Document not available');
    }
  }
  
  /**
   * Initialize app with DOM elements
   */
  private initializeApp(): void {
    console.log('Initializing app with DOM elements');
    try {
      // Wait for DOM to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.setupApp();
        });
      } else {
        this.setupApp();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
  
  /**
   * Setup application when DOM is ready
   */
  private setupApp(): void {
    console.log('Setting up app');
    try {
      // Main containers
      this.container = document.querySelector('.container');
      this.historyPage = document.getElementById('history-page');
      this.profilePage = document.getElementById('profile-page');
      this.chatbotPage = document.getElementById('chatbot-page');
      this.userNameEl = document.getElementById('user-name');
      this.navItems = document.querySelectorAll('.nav-item');
      this.androidBanner = document.getElementById('android-banner');
      this.iosBanner = document.getElementById('ios-banner');
      this.navBar = document.querySelector('.bottom-nav');
      
      if (!this.container || !this.historyPage || !this.profilePage || !this.userNameEl || !this.chatbotPage) {
        console.error('Required DOM elements not found');
        return;
      }
      
      console.log('DOM elements found, initializing modules');
      
      // Initialize modules
      this.authModule = new AuthModule(this.onAuthenticated.bind(this));
      this.paymentCalculator = new PaymentCalculator();
      this.paymentHistory = new PaymentHistory();
      this.userProfile = new UserProfile(
        this.handleLogout.bind(this),
        this.showCalculator.bind(this)
      );
      this.utilityCalculator = new UtilityCalculator();
      this.chatbotModule = new ChatbotModule();
      
      this.initEventListeners();
      this.checkAuthentication();
      this.registerServiceWorker();
      
      console.log('App setup completed');
    } catch (error) {
      console.error('Error setting up app:', error);
    }
  }
  
  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    if (!this.navItems || !this.userNameEl) return;
    
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
    const freshaBtn = document.getElementById('fresha-btn');
    if (freshaBtn) {
      freshaBtn.addEventListener('click', () => {
        window.open('https://partners.fresha.com/reports/table/appointment-summary?appointment_status=unconfirmed%2Cconfirmed%2Carrived%2Cstarted%2Ccompleted&shortcut=today', '_blank');
      });
    }
    
    // Instructions toggle
    this.initInstructionsToggle();
  }
  
  /**
   * Initialize instructions toggle
   */
  private initInstructionsToggle(): void {
    const toggleBtn = document.getElementById('toggle-instructions-btn');
    const instructionsContent = document.getElementById('instructions-content');
    const instructionsContainer = document.querySelector('.instructions-container');

    if (!toggleBtn || !instructionsContent || !instructionsContainer) return;

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
    if (this.authModule) {
      this.authModule.checkAuth();
    }
  }
  
  /**
   * Handle authenticated user
   */
  private onAuthenticated(userData: UserData): void {
    console.log('User authenticated:', userData.name);
    if (!this.container || !this.userNameEl) return;
    
    // Show main app elements
    this.container.style.display = 'block';
    this.userNameEl.textContent = `Hello ${userData.name}`;
    this.userNameEl.style.display = 'block';
    
    // Show navigation bar
    if (this.navBar) {
      this.navBar.style.display = 'flex';
    }
    
    // Set home tab as active
    const homeNav = document.getElementById('home-nav');
    if (homeNav) {
      homeNav.classList.add('active');
    }
    
    // Reset session storage for banner on new authentication
    sessionStorage.removeItem('bannerDismissed');
    this.showInstallBanners();
    
    // Reset scroll position
    window.scrollTo(0, 0);
  }
  
  /**
   * Handle navigation between tabs
   */
  private handleNavigation(target: HTMLElement): void {
    if (!this.navItems) return;
    
    // Remove active class from all navigation items
    this.navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to clicked item
    target.classList.add('active');
    
    // Handle view change based on id
    if (target.id === 'home-nav') {
      this.showCalculator();
    } else if (target.id === 'history-nav') {
      this.showPaymentHistory();
    } else if (target.id === 'help-nav') {
      this.showChatbot();
    }
  }
  
  /**
   * Show calculator view
   */
  public showCalculator(): void {
    if (!this.container || !this.historyPage || !this.profilePage || !this.chatbotPage || !this.navItems) return;
    
    this.container.style.display = 'block';
    this.historyPage.style.display = 'none';
    this.profilePage.style.display = 'none';
    this.chatbotPage.style.display = 'none';
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Set home tab as active
    const homeNav = document.getElementById('home-nav');
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
    if (!this.container || !this.profilePage || !this.chatbotPage || !this.paymentHistory || !this.navItems) return;
    
    this.container.style.display = 'none';
    this.profilePage.style.display = 'none';
    this.chatbotPage.style.display = 'none';
    this.paymentHistory.showPaymentHistory();
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Set history tab as active
    const historyNav = document.getElementById('history-nav');
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
   * Show chatbot help view
   */
  public showChatbot(): void {
    if (!this.container || !this.historyPage || !this.profilePage || !this.chatbotPage || !this.chatbotModule || !this.navItems) return;
    
    this.container.style.display = 'none';
    this.historyPage.style.display = 'none';
    this.profilePage.style.display = 'none';
    this.chatbotModule.showChatbot();
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Set help tab as active
    const helpNav = document.getElementById('help-nav');
    if (helpNav) {
      helpNav.classList.add('active');
      this.navItems.forEach(item => {
        if (item.id !== 'help-nav') {
          item.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * Show user profile view
   */
  public showUserProfile(): void {
    if (!this.container || !this.historyPage || !this.chatbotPage || !this.profilePage || !this.userProfile || !this.navItems) return;
    
    this.container.style.display = 'none';
    this.historyPage.style.display = 'none';
    this.chatbotPage.style.display = 'none';
    this.userProfile.showProfile();
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Deselect all tabs
    this.navItems.forEach(item => item.classList.remove('active'));
  }
  
  /**
   * Handle logout
   */
  private handleLogout(): void {
    // Hide all app elements
    this.hideAppElements();
    
    // Re-check authentication which will show the login screen
    this.checkAuthentication();
    
    // Reinitialize event listeners
    if (this.authModule) {
      this.authModule.initEventListeners();
    }
    
    // Reset scroll position
    window.scrollTo(0, 0);
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
    if (this.container) {
      this.container.style.display = 'none';
    }
    
    if (this.historyPage) {
      this.historyPage.style.display = 'none';
    }
    
    if (this.profilePage) {
      this.profilePage.style.display = 'none';
    }
    
    if (this.chatbotPage) {
      this.chatbotPage.style.display = 'none';
    }
    
    if (this.userNameEl) {
      this.userNameEl.style.display = 'none';
    }
    
    // Hide banners
    if (this.androidBanner) {
      this.androidBanner.style.display = 'none';
    }
    
    if (this.iosBanner) {
      this.iosBanner.style.display = 'none';
    }
  }
  
  /**
   * Show install banners for PWA
   */
  private showInstallBanners(): void {
    // Only show if available
    if (!this.androidBanner || !this.iosBanner) return;
    
    // Always reset banners to hidden first
    this.androidBanner.style.display = 'none';
    this.iosBanner.style.display = 'none';
    
    // Don't show banners if in standalone mode
    if (isInStandaloneMode()) return;
    
    let deferredPrompt: any;
    let bannerDismissed = sessionStorage.getItem('bannerDismissed') === 'true';

    // If banner was dismissed in this session, don't show it again
    if (bannerDismissed) return;

    // For Android devices
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      if (!window.matchMedia('(display-mode: standalone)').matches) {
        // Position the banner at the bottom of the page above the nav bar
        this.androidBanner!.style.display = 'flex';
        document.body.appendChild(this.androidBanner!); // Move to end of body to ensure proper stacking
      }
    });

    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            this.androidBanner!.style.display = 'none';
            sessionStorage.setItem('bannerDismissed', 'true');
          }
          deferredPrompt = null;
        }
      });
    }

    // For iOS devices
    if (isIos() && !isInStandaloneMode()) {
      this.iosBanner!.style.display = 'flex';
      document.body.appendChild(this.iosBanner!); // Move to end of body to ensure proper stacking
    }
    
    // Add event listeners to close buttons
    document.querySelectorAll('.close-banner').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const banner = (e.currentTarget as HTMLElement).closest('.install-banner') as HTMLElement;
        if (banner) {
          banner.style.display = 'none';
          sessionStorage.setItem('bannerDismissed', 'true');
        }
      });
    });
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

// Create a new app instance
console.log('Creating App instance');
const app = new App();

// Export the app instance for debugging
export default app;
