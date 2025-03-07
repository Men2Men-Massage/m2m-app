import { UserData } from './types';
import { StorageService } from './utils/storage-service';
import { createRipple, isIos, isInStandaloneMode } from './utils/helpers';
import { AuthModule } from './components/auth';
import { PaymentCalculator } from './components/payment-calculator';
import { PaymentHistory } from './components/payment-history';
import { UserProfile } from './components/user-profile';
import { UtilityCalculator } from './components/utility-calculator';
import { ChatbotModule } from './components/chatbot';
import { ShiftChecklist, ChecklistType } from './components/shift-checklist';

/**
 * Main Application Class
 */
class App {
  // Initialize properties with null
  private container: HTMLElement | null = null;
  private historyPage: HTMLElement | null = null;
  private profilePage: HTMLElement | null = null;
  private chatbotPage: HTMLElement | null = null;
  private helpFAQPage: HTMLElement | null = null; // New Help FAQ page
  private userNameEl: HTMLElement | null = null;
  private navItems: NodeListOf<Element> | null = null;
  private androidBanner: HTMLElement | null = null;
  private iosBanner: HTMLElement | null = null;
  private navBar: HTMLElement | null = null;
  private updateBanner: HTMLElement | null = null;
  
  private authModule: AuthModule | null = null;
  private paymentCalculator: PaymentCalculator | null = null;
  private paymentHistory: PaymentHistory | null = null;
  private userProfile: UserProfile | null = null;
  private utilityCalculator: UtilityCalculator | null = null;
  private chatbotModule: ChatbotModule | null = null;
  private shiftChecklist: ShiftChecklist | null = null;
  
  // Timer for checking checklist
  private checklistTimer: number | null = null;
  private isCheckingForChecklist: boolean = false;
  
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
      this.helpFAQPage = document.getElementById('help-faq-page'); // New Help FAQ page
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
      this.shiftChecklist = new ShiftChecklist();
      
      this.initEventListeners();
      this.checkAuthentication();
      this.registerServiceWorker();
      this.setupServiceWorkerUpdates();
      
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
    
    // Help FAQ page buttons
    this.initHelpFAQButtons();
  }
  
  /**
   * Initialize Help FAQ page buttons
   */
  private initHelpFAQButtons(): void {
    // Open chatbot button
    const openChatbotBtn = document.getElementById('open-chatbot-btn');
    if (openChatbotBtn) {
      openChatbotBtn.addEventListener('click', () => this.showChatbot());
    }
    
    // Checklist buttons
    if (this.shiftChecklist) {
      // Morning checklist button
      const morningChecklistBtn = document.getElementById('morning-checklist-btn');
      if (morningChecklistBtn) {
        morningChecklistBtn.addEventListener('click', () => {
          this.shiftChecklist?.showManualChecklist(ChecklistType.Morning);
        });
      }
      
      // Evening checklist button
      const eveningChecklistBtn = document.getElementById('evening-checklist-btn');
      if (eveningChecklistBtn) {
        eveningChecklistBtn.addEventListener('click', () => {
          this.shiftChecklist?.showManualChecklist(ChecklistType.Evening);
        });
      }
      
      // Night checklist button
      const nightChecklistBtn = document.getElementById('night-checklist-btn');
      if (nightChecklistBtn) {
        nightChecklistBtn.addEventListener('click', () => {
          this.shiftChecklist?.showManualChecklist(ChecklistType.Night);
        });
      }
    }
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
   * Start periodic checklist check
   */
  private startChecklistTimer(): void {
    // Check every 5 minutes
    this.checklistTimer = window.setInterval(() => {
      this.checkForShiftChecklist();
    }, 5 * 60 * 1000);
    
    // Also run immediately
    this.checkForShiftChecklist();
  }
  
  /**
   * Stop periodic checklist check
   */
  private stopChecklistTimer(): void {
    if (this.checklistTimer !== null) {
      clearInterval(this.checklistTimer);
      this.checklistTimer = null;
    }
  }
  
  /**
   * Check if shift checklist should be shown
   */
  private async checkForShiftChecklist(): Promise<void> {
    if (!this.shiftChecklist || this.isCheckingForChecklist) {
      return;
    }
    
    try {
      // Set flag to prevent multiple checks at once
      this.isCheckingForChecklist = true;
      
      // Check if checklist should be shown
      const shouldShow = await this.shiftChecklist.shouldShowChecklist();
      
      // If checklist should be shown, show it
      if (shouldShow) {
        console.log('Showing shift checklist');
        this.shiftChecklist.showChecklist();
      }
    } catch (error) {
      console.error('Error checking for shift checklist:', error);
    } finally {
      // Reset flag
      this.isCheckingForChecklist = false;
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
    
    // Check if shift checklist should be shown
    this.checkForShiftChecklist();
    
    // Start periodic checklist check
    this.startChecklistTimer();
    
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
      this.showHelpFAQ(); // Modified to show Help FAQ page instead of chatbot directly
    }
  }
  
  /**
   * Show calculator view
   */
  public showCalculator(): void {
    if (!this.container || !this.historyPage || !this.profilePage || !this.chatbotPage || !this.helpFAQPage || !this.chatbotModule || !this.navItems) return;
    
    // Nascondi il chatbot e ripristina lo scrolling
    this.chatbotModule.hideChatbot();
    
    // Mostra la pagina corretta
    this.container.style.display = 'block';
    this.historyPage.style.display = 'none';
    this.profilePage.style.display = 'none';
    this.chatbotPage.style.display = 'none';
    this.helpFAQPage.style.display = 'none';
    
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
    if (!this.container || !this.profilePage || !this.chatbotPage || !this.helpFAQPage || !this.paymentHistory || !this.chatbotModule || !this.navItems) return;
    
    // Nascondi il chatbot e ripristina lo scrolling
    this.chatbotModule.hideChatbot();
    
    // Mostra la pagina corretta
    this.container.style.display = 'none';
    this.profilePage.style.display = 'none';
    this.chatbotPage.style.display = 'none';
    this.helpFAQPage.style.display = 'none';
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
   * Show Help FAQ page
   */
  public showHelpFAQ(): void {
    if (!this.container || !this.historyPage || !this.profilePage || !this.chatbotPage || !this.helpFAQPage || !this.chatbotModule || !this.navItems) return;
    
    // Nascondi il chatbot e ripristina lo scrolling
    this.chatbotModule.hideChatbot();
    
    // Hide other pages
    this.container.style.display = 'none';
    this.historyPage.style.display = 'none';
    this.profilePage.style.display = 'none';
    this.chatbotPage.style.display = 'none';
    
    // Show Help FAQ page
    this.helpFAQPage.style.display = 'block';
    
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
    
    // Reset scroll position
    window.scrollTo(0, 0);
  }
  
  /**
   * Show chatbot help view
   */
  public showChatbot(): void {
    if (!this.container || !this.historyPage || !this.profilePage || !this.chatbotPage || !this.helpFAQPage || !this.chatbotModule || !this.navItems) return;
    
    // Hide other pages
    this.container.style.display = 'none';
    this.historyPage.style.display = 'none';
    this.profilePage.style.display = 'none';
    this.helpFAQPage.style.display = 'none';
    
    // Show chatbot view (a full screen overlay)
    this.chatbotModule.showChatbot();
    
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
    if (!this.container || !this.historyPage || !this.chatbotPage || !this.helpFAQPage || !this.profilePage || !this.userProfile || !this.chatbotModule || !this.navItems) return;
    
    // Nascondi il chatbot e ripristina lo scrolling
    this.chatbotModule.hideChatbot();
    
    // Mostra la pagina corretta
    this.container.style.display = 'none';
    this.historyPage.style.display = 'none';
    this.chatbotPage.style.display = 'none';
    this.helpFAQPage.style.display = 'none';
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
    // Stop checklist timer
    this.stopChecklistTimer();
    
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
    
    if (this.helpFAQPage) {
      this.helpFAQPage.style.display = 'none';
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
    
    // Hide update banner if present
    if (this.updateBanner) {
      this.updateBanner.style.display = 'none';
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
  
  /**
   * Set up service worker update management
   */
  private setupServiceWorkerUpdates(): void {
    if ('serviceWorker' in navigator) {
      // Track updates
      let refreshing = false;
      
      // Listen for controller change (service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('New service worker activated, refreshing page...');
          window.location.reload();
        }
      });
      
      // Create update notification banner
      this.createUpdateBanner();
      
      // Check for updates periodically (every 60 minutes)
      setInterval(() => {
        this.checkForUpdates();
      }, 60 * 60 * 1000);
      
      // Also check for updates when the app starts
      this.checkForUpdates();
    }
  }
  
  /**
   * Check for service worker updates
   */
  private checkForUpdates(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update().then(() => {
            if (registration.waiting) {
              this.showUpdateNotification();
            }
          }).catch(err => {
            console.error('Error updating service worker:', err);
          });
        }
      });
    }
  }
  
  /**
   * Create the update notification banner
   */
  private createUpdateBanner(): void {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.id = 'update-banner';
    updateBanner.style.display = 'none';
    updateBanner.innerHTML = `
      <span class="close-banner">&times;</span>
      <div class="update-banner-content">
        <div class="update-banner-text">
          🔄 A new version is available!
        </div>
      </div>
      <button id="update-app-btn">Update Now</button>
    `;
    
    document.body.appendChild(updateBanner);
    this.updateBanner = updateBanner;
    
    // Add event listeners
    const closeButton = updateBanner.querySelector('.close-banner');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        updateBanner.style.display = 'none';
      });
    }
    
    const updateButton = document.getElementById('update-app-btn');
    if (updateButton) {
      updateButton.addEventListener('click', () => {
        this.applyUpdate();
      });
    }
  }
  
  /**
   * Show the update notification
   */
  private showUpdateNotification(): void {
    if (this.updateBanner) {
      this.updateBanner.style.display = 'flex';
    }
  }
  
  /**
   * Apply the pending update
   */
  private applyUpdate(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          // Send a message to the waiting service worker
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  }
}

// Create a new app instance
console.log('Creating App instance');
const app = new App();

// Export the app instance for debugging
export default app;
