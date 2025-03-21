// Types for the M2M Payment Calculator application

/**
 * User profile data structure
 */
export interface UserData {
  name: string;
  email: string;
  profileImage: string | null;
}

/**
 * Payment data structure
 */
export interface Payment {
  date: string;
  dueAmount: number;
  giftCardAmount: number;
  note: string;
  giftCardRequestSent: boolean;
}

/**
 * Gift card payment request data
 */
export interface GiftCardRequest {
  paymentIndex: number | null;
  date: string | null;
  amount: number;
}

/**
 * Gift card email request data structure
 */
export interface GiftCardEmailRequest {
  userName: string;
  date: string;
  amount: number;
  giftCardNumber?: string;
  comment: string;
}

/**
 * Holiday request data structure
 */
export interface HolidayRequest {
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

/**
 * API success response structure for gift card request
 */
export interface GiftCardSuccessResponse {
  success: boolean;
  message: string;
  messageId: string;
}

/**
 * API success response structure for holiday request
 */
export interface HolidayRequestSuccessResponse {
  success: boolean;
  message: string;
  messageId: string;
}

/**
 * Location options
 */
export enum Location {
  PrenzlauerBerg = "Prenzlauer Berg",
  Schoeneberg = "Schoeneberg"
}

/**
 * Bank information structure
 */
export interface BankInfo {
  id: string;
  name: string;
  uriScheme: string | null;
  webUrl: string | null;
}
