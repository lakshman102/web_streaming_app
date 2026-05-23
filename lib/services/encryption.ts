import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production'

export const encryptionService = {
  /**
   * Encrypt sensitive data (tokens, API keys)
   */
  encrypt: (data: string): string => {
    try {
      return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
    } catch (error) {
      console.error('[v0] Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  },

  /**
   * Decrypt sensitive data
   */
  decrypt: (encryptedData: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('[v0] Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  },

  /**
   * Encrypt token object
   */
  encryptToken: (token: { accessToken: string; refreshToken?: string }): object => {
    return {
      accessToken: exports.encryptionService.encrypt(token.accessToken),
      refreshToken: token.refreshToken ? exports.encryptionService.encrypt(token.refreshToken) : undefined,
    }
  },

  /**
   * Decrypt token object
   */
  decryptToken: (encrypted: { accessToken: string; refreshToken?: string }): object => {
    return {
      accessToken: exports.encryptionService.decrypt(encrypted.accessToken),
      refreshToken: encrypted.refreshToken ? exports.encryptionService.decrypt(encrypted.refreshToken) : undefined,
    }
  },
}
