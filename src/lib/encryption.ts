// Simple encryption utility
const ENCRYPTION_KEY = 'moonshot_secret_key_2024';

export const encryption = {
  // Encrypt data
  encrypt: (text: string): string => {
    try {
      const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
      const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
      const applySaltToChar = (code: number) => textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);

      return text
        .split('')
        .map(c => c.charCodeAt(0))
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to plain text if encryption fails
    }
  },

  // Decrypt data
  decrypt: (encoded: string): string => {
    try {
      const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
      const applySaltToChar = (code: number) => textToChars(ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);

      return encoded
        .match(/.{1,2}/g)
        ?.map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('') || encoded;
    } catch (error) {
      console.error('Decryption error:', error);
      return encoded; // Fallback to encoded text if decryption fails
    }
  }
}; 