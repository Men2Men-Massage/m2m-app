import { UserData, Payment } from '../types';
import { ChecklistType } from '../components/shift-checklist';

/**
 * Storage keys for localStorage
 */
const STORAGE_KEYS = {
  AUTH_CODE: 'm2m_access',
  USER_DATA: 'm2m_user_data',
  PAYMENTS: 'm2m_payments',
  CHECKLIST_SHOWN: 'm2m_checklist_shown',
};

/**
 * Authentication code for the application
 */
export const AUTH_CODE = "1228";

/**
 * Service for managing localStorage operations
 */
export class StorageService {
  /**
   * Check if the user is authenticated
   */
  static isAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH_CODE) === AUTH_CODE;
  }

  /**
   * Store authentication code in localStorage
   */
  static setAuthenticated(): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_CODE, AUTH_CODE);
  }

  /**
   * Remove authentication from localStorage
   */
  static clearAuthentication(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_CODE);
  }

  /**
   * Get user data from localStorage
   */
  static getUserData(): UserData {
    const defaultData: UserData = {
      name: '',
      email: '',
      profileImage: null
    };
    
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : defaultData;
    } catch (error) {
      console.error('Error parsing user data from localStorage', error);
      return defaultData;
    }
  }

  /**
   * Save user data to localStorage
   */
  static saveUserData(userData: UserData): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  /**
   * Remove user data from localStorage
   */
  static clearUserData(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Get payments from localStorage
   */
  static getPayments(): Payment[] {
    try {
      const payments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return payments ? JSON.parse(payments) : [];
    } catch (error) {
      console.error('Error parsing payments from localStorage', error);
      return [];
    }
  }

  /**
   * Save payments to localStorage
   */
  static savePayments(payments: Payment[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }

  /**
   * Add a new payment to localStorage
   */
  static addPayment(payment: Payment): void {
    const payments = this.getPayments();
    payments.push(payment);
    this.savePayments(payments);
  }

  /**
   * Update an existing payment
   */
  static updatePayment(index: number, updatedPayment: Partial<Payment>): boolean {
    const payments = this.getPayments();
    
    if (index >= 0 && index < payments.length) {
      payments[index] = { ...payments[index], ...updatedPayment };
      this.savePayments(payments);
      return true;
    }
    
    return false;
  }

  /**
   * Remove a payment
   */
  static removePayment(index: number): boolean {
    const payments = this.getPayments();
    
    if (index >= 0 && index < payments.length) {
      payments.splice(index, 1);
      this.savePayments(payments);
      return true;
    }
    
    return false;
  }

  /**
   * Remove all payments
   */
  static clearPayments(): void {
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
  }

  /**
   * Get the last date when a specific checklist was shown
   */
  static getLastShownDate(checklistType: ChecklistType): Date | null {
    const key = `${STORAGE_KEYS.CHECKLIST_SHOWN}_${checklistType}`;
    const dateStr = localStorage.getItem(key);
    
    if (!dateStr) {
      return null;
    }
    
    try {
      return new Date(JSON.parse(dateStr));
    } catch (error) {
      console.error('Error parsing date from localStorage', error);
      return null;
    }
  }

  /**
   * Save the current date as the last shown date for a specific checklist
   */
  static saveLastShownDate(checklistType: ChecklistType): void {
    const key = `${STORAGE_KEYS.CHECKLIST_SHOWN}_${checklistType}`;
    localStorage.setItem(key, JSON.stringify(new Date().toISOString()));
  }

  /**
   * Clear all application data
   */
  static clearAllData(): void {
    // Clear all localStorage keys used by the application
    this.clearAuthentication();
    this.clearUserData();
    this.clearPayments();
    
    // Clear checklist data
    localStorage.removeItem(`${STORAGE_KEYS.CHECKLIST_SHOWN}_${ChecklistType.Evening}`);
    localStorage.removeItem(`${STORAGE_KEYS.CHECKLIST_SHOWN}_${ChecklistType.Night}`);
    
    // For any potential session storage items
    sessionStorage.clear();
    
    // Force reload of application state
    window.location.reload();
  }
}
