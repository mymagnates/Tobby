/**
 * Property ID Utilities
 *
 * This module provides utilities to handle property ID inconsistencies across the application.
 * Firebase document IDs are always strings, but they might come from different sources
 * (route params, form inputs, database queries) with different formats.
 */

/**
 * Normalizes a property ID to ensure consistent format
 * @param {any} id - The property ID to normalize
 * @returns {string|null} - Normalized property ID as string, or null if invalid
 */
export const normalizePropertyId = (id) => {
  if (!id) return null

  // Convert to string and trim whitespace
  const normalized = String(id).trim()

  // Return null for empty strings
  if (!normalized) return null

  return normalized
}

/**
 * Safely compares two property IDs for equality
 * @param {any} id1 - First property ID
 * @param {any} id2 - Second property ID
 * @returns {boolean} - True if IDs are equal after normalization
 */
export const comparePropertyIds = (id1, id2) => {
  const norm1 = normalizePropertyId(id1)
  const norm2 = normalizePropertyId(id2)

  // Both null/empty
  if (!norm1 && !norm2) return true

  // One is null/empty
  if (!norm1 || !norm2) return false

  // String comparison
  return norm1 === norm2
}

/**
 * Validates that a property ID is in the correct format
 * @param {any} id - The property ID to validate
 * @returns {boolean} - True if valid
 */
export const isValidPropertyId = (id) => {
  const normalized = normalizePropertyId(id)
  return normalized !== null && normalized.length > 0
}

/**
 * Ensures property ID is properly formatted for database operations
 * @param {any} id - The property ID to format
 * @returns {string} - Formatted property ID for database use
 * @throws {Error} - If ID is invalid
 */
export const formatPropertyIdForDatabase = (id) => {
  const normalized = normalizePropertyId(id)
  if (!normalized) {
    throw new Error(`Invalid property ID: ${id}`)
  }
  return normalized
}

/**
 * Safely extracts property ID from various object structures
 * @param {any} obj - Object that might contain a property ID
 * @returns {string|null} - Extracted and normalized property ID
 */
export const extractPropertyId = (obj) => {
  if (!obj) return null

  // Direct property ID
  if (typeof obj === 'string' || typeof obj === 'number') {
    return normalizePropertyId(obj)
  }

  // Object with id property
  if (obj.id) {
    return normalizePropertyId(obj.id)
  }

  // Object with property_id property
  if (obj.property_id) {
    return normalizePropertyId(obj.property_id)
  }

  // Nested property object
  if (obj.property && obj.property.id) {
    return normalizePropertyId(obj.property.id)
  }

  return null
}

/**
 * Debug utility to log property ID comparison details
 * @param {any} id1 - First property ID
 * @param {any} id2 - Second property ID
 * @param {string} context - Context for debugging
 */
export const debugPropertyIdComparison = (id1, id2, context = '') => {
  const norm1 = normalizePropertyId(id1)
  const norm2 = normalizePropertyId(id2)
  const isEqual = comparePropertyIds(id1, id2)

  console.log(`=== Property ID Comparison Debug ${context ? `(${context})` : ''} ===`)
  console.log('Original ID 1:', id1, 'Type:', typeof id1)
  console.log('Original ID 2:', id2, 'Type:', typeof id2)
  console.log('Normalized ID 1:', norm1)
  console.log('Normalized ID 2:', norm2)
  console.log('Are Equal:', isEqual)
  console.log('=== End Property ID Comparison Debug ===')

  return isEqual
}
