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
    
    // Add event listener for iframe load to inject custom CSS
    if (this.chatbotIframe) {
      this.chatbotIframe.addEventListener('load', () => {
        this.injectCustomCSS();
      });
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
   * Inject custom CSS into the iframe to hide the disclaimer
   */
  private injectCustomCSS(): void {
    if (!this.chatbotIframe) return;
    
    try {
      // Get iframe content window
      const iframeWindow = this.chatbotIframe.contentWindow;
      if (!iframeWindow) return;
      
      // Try to access the iframe document
      const iframeDocument = iframeWindow.document;
      if (!iframeDocument) return;
      
      // Create a style element
      const style = iframeDocument.createElement('style');
      style.textContent = `
        /* Hide footer disclaimers and terms of use text */
        div[class*="footer"], 
        div[class*="terms"], 
        div[class*="disclaimer"],
        div[class*="terms-of-use"],
        div[id*="footer"],
        div[id*="terms"],
        div[id*="disclaimer"],
        p:contains("By chatting"),
        p:contains("Terms of Use"),
        div:contains("By chatting"),
        div:contains("Terms of Use"),
        .jfFormAgentFooter,
        [class*="agent-footer"],
        [class*="jotform-footer"],
        [class*="jotform-agent-footer"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          pointer-events: none !important;
        }
        
        /* Increase body container height to fill the space */
        body, 
        .jfFormAgentContainer,
        [class*="agent-container"] {
          height: 100% !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
      `;
      
      // Append the style to the iframe document
      iframeDocument.head.appendChild(style);
      
      console.log('Custom CSS injected into chatbot iframe');
    } catch (error) {
      console.error('Failed to inject custom CSS into iframe:', error);
    }
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
      
      // Try to inject custom CSS again when showing the chatbot
      this.injectCustomCSS();
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
