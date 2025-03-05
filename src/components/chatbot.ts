/**
 * Chatbot Module
 */
export class ChatbotModule {
  private chatbotPage: HTMLElement;
  private chatbotIframe: HTMLIFrameElement | null = null;
  private disclaimerCover: HTMLElement | null = null;
  private isVisible: boolean = false;
  private isKeyboardVisible: boolean = false;
  
  /**
   * Create a ChatbotModule instance
   */
  constructor() {
    this.chatbotPage = document.getElementById('chatbot-page') as HTMLElement;
    this.chatbotIframe = document.getElementById('JotFormIFrame-0195628f8f8773efa4a82b2494c37ae1e427') as HTMLIFrameElement;
    this.disclaimerCover = document.getElementById('disclaimer-cover') as HTMLElement;
    
    this.initChatbot();
  }
  
  /**
   * Initialize the chatbot
   */
  private initChatbot(): void {
    // Initialize the JotForm embed handler script
    this.loadJotformScript();
    
    // Monitor resize events for keyboard visibility
    this.setupKeyboardDetection();
    
    // Adjust disclaimer cover on window resize
    window.addEventListener('resize', () => {
      if (this.isVisible) {
        this.adjustCoverPosition();
      }
    });
  }
  
  /**
   * Set up keyboard detection
   */
  private setupKeyboardDetection(): void {
    // Initial window height
    let windowHeight = window.innerHeight;
    
    // Listen for resize events (keyboard opening causes resize)
    window.addEventListener('resize', () => {
      // If the new height is significantly smaller, keyboard is likely visible
      const newWindowHeight = window.innerHeight;
      
      if (newWindowHeight < windowHeight * 0.75) {
        // Keyboard is likely visible
        this.isKeyboardVisible = true;
        this.updateCoverVisibility();
      } else {
        // Keyboard is likely hidden
        this.isKeyboardVisible = false;
        this.updateCoverVisibility();
      }
      
      // Update the reference height
      windowHeight = newWindowHeight;
    });
    
    // Also listen for focus/blur events on the document
    document.addEventListener('focusin', () => {
      // Input element has received focus - might be keyboard showing
      setTimeout(() => {
        this.isKeyboardVisible = true;
        this.updateCoverVisibility();
      }, 300);
    });
    
    document.addEventListener('focusout', () => {
      // Input element has lost focus - might be keyboard hiding
      setTimeout(() => {
        this.isKeyboardVisible = false;
        this.updateCoverVisibility();
      }, 300);
    });
    
    // Additional handling for touch events (tapping on input fields)
    document.addEventListener('touchstart', () => {
      // User touched screen - might be tapping on input field
      setTimeout(() => {
        if (window.innerHeight < windowHeight * 0.75) {
          this.isKeyboardVisible = true;
          this.updateCoverVisibility();
        }
      }, 500);
    });
  }
  
  /**
   * Update cover visibility based on keyboard state
   */
  private updateCoverVisibility(): void {
    if (!this.disclaimerCover) return;
    
    if (this.isKeyboardVisible) {
      // Keyboard is visible, hide the cover
      this.disclaimerCover.style.display = 'none';
    } else {
      // Keyboard is hidden, show the cover
      this.disclaimerCover.style.display = 'block';
    }
  }
  
  /**
   * Load the JotForm script
   */
  private loadJotformScript(): void {
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.onload = () => {
      // Initialize the JotForm embed handler after the script has loaded
      const initScript = document.createElement('script');
      initScript.innerHTML = `
        if (window.jotformEmbedHandler) {
          window.jotformEmbedHandler("iframe[id='JotFormIFrame-0195628f8f8773efa4a82b2494c37ae1e427']", "https://eu.jotform.com");
        }
      `;
      document.body.appendChild(initScript);
    };
    document.body.appendChild(script);
  }
  
  /**
   * Adjust the position of the disclaimer cover
   */
  private adjustCoverPosition(): void {
    if (!this.disclaimerCover) return;
    
    // On iOS with notch, adjust for safe area
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      const safeAreaBottom = window.getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom');
      if (safeAreaBottom && safeAreaBottom !== '0px') {
        this.disclaimerCover.style.height = `calc(40px + ${safeAreaBottom})`;
      }
    }
    
    // Update visibility based on keyboard state
    this.updateCoverVisibility();
  }
  
  /**
   * Show chatbot page
   */
  public showChatbot(): void {
    // Solo se il chatbot non è già visibile
    if (this.isVisible) return;
    
    // Make sure the body doesn't scroll when chatbot is shown
    document.body.style.overflow = 'hidden';
    
    // Show the chatbot page
    this.chatbotPage.style.display = 'block';
    
    // Ensure the iframe fits the container
    if (this.chatbotIframe) {
      this.adjustIframeHeight();
    }
    
    // Adjust disclaimer cover position
    this.adjustCoverPosition();
    
    this.isVisible = true;
  }
  
  /**
   * Hide chatbot page
   */
  public hideChatbot(): void {
    // Solo se il chatbot è attualmente visibile
    if (!this.isVisible) return;
    
    // Restore normal scrolling when chatbot is hidden
    document.body.style.overflow = '';
    
    // Hide the chatbot page
    this.chatbotPage.style.display = 'none';
    
    this.isVisible = false;
  }
  
  /**
   * Adjust iframe height to fit container
   */
  private adjustIframeHeight(): void {
    if (!this.chatbotIframe) return;
    
    const container = document.getElementById('chatbot-container');
    if (!container) return;
    
    // Set the iframe height to match container
    const containerHeight = container.clientHeight;
    this.chatbotIframe.style.height = `${containerHeight}px`;
  }
  
  /**
   * Check if chatbot is currently visible
   */
  public isCurrentlyVisible(): boolean {
    return this.isVisible;
  }
}
