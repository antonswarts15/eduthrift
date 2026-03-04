// Ozow Payment Gateway Type Definitions

interface OzowCheckout {
  open(url: string): void;
  close(): void;
}

interface Window {
  OzowCheckout?: OzowCheckout;
}
