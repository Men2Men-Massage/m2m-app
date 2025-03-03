/**
 * Utility Calculator Module
 */
export class UtilityCalculator {
  private calculatorModal: HTMLElement;
  private calculatorDisplay: HTMLInputElement;
  
  /**
   * Create a UtilityCalculator instance
   */
  constructor() {
    this.calculatorModal = document.getElementById('calculator-modal') as HTMLElement;
    this.calculatorDisplay = document.getElementById('calculator-display') as HTMLInputElement;
    
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
    
    // Calculator buttons
    const calcButtons = document.querySelectorAll('.calc-btn');
    calcButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent || '';
        
        if (buttonText === 'C') {
          this.clearCalculator();
        } else if (buttonText === '=') {
          this.calculateResult();
        } else if (buttonText.includes('backspace')) {
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
  }
  
  /**
   * Close calculator modal
   */
  public closeCalculator(): void {
    this.calculatorModal.style.display = 'none';
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
  }
  
  /**
   * Remove the last character from the calculator display
   */
  private backspaceCalculator(): void {
    this.calculatorDisplay.value = this.calculatorDisplay.value.slice(0, -1);
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
      }
    } catch (error) {
      this.calculatorDisplay.value = 'Error';
      setTimeout(() => {
        this.calculatorDisplay.value = '';
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
