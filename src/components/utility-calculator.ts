/**
 * Utility Calculator Module
 */
export class UtilityCalculator {
  private calculatorModal: HTMLElement;
  private calculatorDisplay: HTMLInputElement;
  private calculatorCopyBtn: HTMLElement;
  
  /**
   * Create a UtilityCalculator instance
   */
  constructor() {
    this.calculatorModal = document.getElementById('calculator-modal') as HTMLElement;
    this.calculatorDisplay = document.getElementById('calculator-display') as HTMLInputElement;
    this.calculatorCopyBtn = document.getElementById('calculator-copy-btn') as HTMLElement;
    
    this.initEventListeners();
  }
  
  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Open calculator button
    const calculatorBtn = document.getElementById('calculator-btn') as HTMLElement;
    calculatorBtn.addEventListener('click', () => this.openCalculator());
    
    // Close calculator button
    const closeCalculatorBtn = document.querySelector('.close-calculator') as HTMLElement;
    closeCalculatorBtn.addEventListener('click', () => this.closeCalculator());
    
    // Copy button
    this.calculatorCopyBtn.addEventListener('click', () => this.copyCalculatorValue());
    
    // Update copy button visibility on calculator display input changes
    this.calculatorDisplay.addEventListener('input', () => this.updateCopyButtonVisibility());
    
    // Calculator buttons
    const calcButtons = document.querySelectorAll('.calc-btn');
    calcButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent || '';
        const buttonClass = button.className;
        
        if (buttonText === 'C') {
          this.clearCalculator();
        } else if (buttonText === '=') {
          this.calculateResult();
        } else if (buttonClass.includes('backspace-btn') || button.innerHTML.includes('fa-backspace')) {
          this.backspaceCalculator();
        } else if (buttonText === '×') {
          this.appendToCalculator('*');
        } else if (buttonText === '÷') {
          this.appendToCalculator('/');
        } else if (buttonText === '−') {
          this.appendToCalculator('-');
        } else {
          this.appendToCalculator(buttonText);
        }
        
        // Update copy button visibility after each operation
        this.updateCopyButtonVisibility();
      });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
      if (event.target === this.calculatorModal) {
        this.closeCalculator();
      }
    });
    
    // Add keyboard support
    document.addEventListener('keydown', (event) => this.handleKeyboardInput(event));
  }
  
  /**
   * Open calculator modal
   */
  public openCalculator(): void {
    this.calculatorModal.style.display = 'flex';
    this.calculatorDisplay.value = '';
    this.updateCopyButtonVisibility();
  }
  
  /**
   * Close calculator modal
   */
  public closeCalculator(): void {
    this.calculatorModal.style.display = 'none';
  }
  
  /**
   * Update copy button visibility based on calculator display content
   */
  private updateCopyButtonVisibility(): void {
    if (this.calculatorDisplay.value.trim()) {
      this.calculatorCopyBtn.style.display = 'block';
    } else {
      this.calculatorCopyBtn.style.display = 'none';
    }
  }
  
  /**
   * Copy calculator value to clipboard
   */
  private copyCalculatorValue(): void {
    const textToCopy = this.calculatorDisplay.value;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          // Show brief success animation or feedback
          const originalIcon = this.calculatorCopyBtn.innerHTML;
          this.calculatorCopyBtn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => {
            this.calculatorCopyBtn.innerHTML = originalIcon;
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          alert('Failed to copy value. Please copy manually.');
        });
    }
  }
  
  /**
   * Append a value to the calculator display
   */
  private appendToCalculator(value: string): void {
    this.calculatorDisplay.value += value;
  }
  
  /**
   * Clear calculator display
   */
  private clearCalculator(): void {
    this.calculatorDisplay.value = '';
    this.updateCopyButtonVisibility();
  }
  
  /**
   * Remove the last character from the calculator display
   */
  private backspaceCalculator(): void {
    this.calculatorDisplay.value = this.calculatorDisplay.value.slice(0, -1);
    this.updateCopyButtonVisibility();
  }
  
  /**
   * Calculate the result of the expression
   */
  private calculateResult(): void {
    try {
      // Replace × with * and ÷ with / for evaluation
      let expression = this.calculatorDisplay.value
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
        
      // Evaluate the expression
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      
      // Display the result with 2 decimal places if it's a floating point number
      if (result !== undefined) {
        this.calculatorDisplay.value = Number.isInteger(result) ? 
          result.toString() : 
          parseFloat(result.toFixed(2)).toString();
        
        // Update copy button visibility
        this.updateCopyButtonVisibility();
      }
    } catch (error) {
      this.calculatorDisplay.value = 'Error';
      this.updateCopyButtonVisibility();
      setTimeout(() => {
        this.calculatorDisplay.value = '';
        this.updateCopyButtonVisibility();
      }, 1500);
    }
  }
  
  /**
   * Handle keyboard input for calculator
   */
  private handleKeyboardInput(event: KeyboardEvent): void {
    // Only process keyboard input if calculator is open
    if (this.calculatorModal.style.display === 'flex') {
      const key = event.key;
      
      // Check if key is a number, operator, decimal point, or parenthesis
      if (/^[0-9+\-*/.()]$/.test(key)) {
        this.appendToCalculator(key);
        this.updateCopyButtonVisibility();
        event.preventDefault();
      } else if (key === 'Enter') {
        this.calculateResult();
        event.preventDefault();
      } else if (key === 'Backspace') {
        this.backspaceCalculator();
        event.preventDefault();
      } else if (key === 'Escape') {
        this.closeCalculator();
        event.preventDefault();
      } else if (key === 'c' || key === 'C') {
        this.clearCalculator();
        event.preventDefault();
      }
    }
  }
}
