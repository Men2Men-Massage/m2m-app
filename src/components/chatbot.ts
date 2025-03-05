/**
 * Chatbot Module
 */
export class ChatbotModule {
  private chatbotPage: HTMLElement;
  private chatbotIframe: HTMLIFrameElement | null = null;
  private isVisible: boolean = false;
  
  /**
   * Create a ChatbotModule instance
   */
  constructor() {
    this.chatbotPage = document.getElementById('chatbot-page') as HTMLElement;
    
    this.initChatbot();
  }
  
  /**
   * Initialize the chatbot
   */
  private initChatbot(): void {
    // Get a reference to the iframe
    this.chatbotIframe = document.getElementById('JotFormIFrame-0195628f8f8773efa4a82b2494c37ae1e427') as HTMLIFrameElement;
    
    // Initialize the JotForm embed handler script
    this.loadJotformScript();
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
