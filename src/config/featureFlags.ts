/**
 * Feature flags configuration for Apollo
 * 
 * Controls which features are enabled or disabled in the application
 */

export const featureFlags = {
  /**
   * When true, translatable columns are only stored in the translation table
   * When false, translatable columns are stored in both their original table and the translation table
   */
  skipTranslatableColumns: false,
}

export default featureFlags;
