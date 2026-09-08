import { describe, expect, it } from 'vitest'
import {
  filterProperties,
  propertyScopeLocation,
  readPropertyScope,
  requiresSingleProperty,
  supportsPropertyScope,
} from '../../../src/utils/workspaceScope'

describe('workspace property scope', () => {
  it('recognizes only property-aware routes', () => {
    for (const path of ['/', '/transactions', '/assets/p1', '/my-properties', '/reports'])
      expect(supportsPropertyScope(path)).toBe(true)
    for (const path of ['/user-profile', '/public/login', '/sp-dashboard', '/assets-other'])
      expect(supportsPropertyScope(path)).toBe(false)
  })
  it('does not offer aggregate context for a single-property detail screen', () => {
    for (const path of ['/property-view', '/my-properties', '/property-services'])
      expect(requiresSingleProperty(path)).toBe(true)
    expect(requiresSingleProperty('/transactions')).toBe(false)
  })
  it('reads legacy asset parameters and ignores ambiguous query arrays', () => {
    expect(readPropertyScope({ params: { propertyId: 'p1' }, query: { propertyId: 'p2' } })).toBe(
      'p1',
    )
    expect(readPropertyScope({ query: { propertyId: ['p1', 'p2'] } })).toBe(null)
    expect(readPropertyScope({ query: { propertyId: '  ' } })).toBe(null)
  })
  it('clears both legacy path scope and query scope while preserving other filters', () => {
    const route = {
      path: '/assets/p1',
      query: { propertyId: 'p1', category: 'HVAC' },
      hash: '#list',
    }
    expect(propertyScopeLocation(route, null)).toEqual({
      path: '/assets',
      query: { category: 'HVAC' },
      hash: '#list',
    })
    expect(propertyScopeLocation(route, 'p2').query).toEqual({ propertyId: 'p2', category: 'HVAC' })
    expect(route.query.propertyId).toBe('p1')
  })
  it('searches names and addresses with multiple terms and handles empty inputs', () => {
    const properties = [
      { id: 'a', nickname: 'Garden House', address: '123 Oak Lane', city: 'Plano' },
      { id: 'b', address: '45 Cedar Road' },
    ]
    expect(filterProperties(properties, 'PLANO garden')).toEqual([properties[0]])
    expect(filterProperties(properties, 'cedar')).toEqual([properties[1]])
    expect(filterProperties(properties, null)).toEqual(properties)
    expect(filterProperties([], 'test')).toEqual([])
  })
})
