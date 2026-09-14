import { ref } from 'vue'
import { config, flushPromises, mount } from '@vue/test-utils'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import FirebaseAuth from '../../../src/components/FirebaseAuth.vue'
import RegisterLanding from '../../../src/pages/RegisterLandingPage.vue'

const mocks = vi.hoisted(() => ({
  firebase: {},
  auth: { currentUser: null },
  route: { path: '/public/login', query: {} },
  push: vi.fn(),
  replace: vi.fn(),
  setUser: vi.fn(),
  loadUserProfile: vi.fn(),
  notify: vi.fn(),
}))
vi.mock('../../../src/composables/useFirebase', () => ({ useFirebase: () => mocks.firebase }))
vi.mock('../../../src/boot/firebase', () => ({
  auth: mocks.auth,
  authStateReady: Promise.resolve(),
}))
vi.mock('../../../src/stores/userDataStore', () => ({ useUserDataStore: () => mocks }))
vi.mock('vue-router', () => ({ useRoute: () => mocks.route, useRouter: () => mocks }))
vi.mock('quasar', async (original) => ({ ...(await original()), Notify: { create: mocks.notify } }))

const stubs = {
  'q-input': {
    props: ['modelValue', 'label', 'rules', 'disable'],
    emits: ['update:modelValue'],
    template: `<label>{{ label }}<input v-bind="$attrs" :value="modelValue" :disabled="disable" @input="$emit('update:modelValue', $event.target.value)" /><slot name="append" /></label>`,
    inheritAttrs: false,
  },
  'q-btn': {
    props: ['label', 'to', 'loading', 'disable'],
    template: '<button :disabled="loading || disable">{{ label }}<slot /></button>',
  },
  'q-form': {
    template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>',
    emits: ['submit'],
  },
  'q-banner': { template: '<div><slot /></div>' },
  'q-option-group': true,
  'q-spinner-dots': true,
}
const render = (component) => mount(component, { global: { stubs } })
const button = (wrapper, label) => wrapper.findAll('button').find((node) => node.text() === label)
const populateSignup = async (wrapper) => {
  for (const [name, value] of Object.entries({
    name: 'Alex Lee',
    email: 'alex@example.test',
    password: 'secret123',
    'confirm-password': 'secret123',
  })) {
    await wrapper.get(`input[name="${name}"]`).setValue(value)
  }
}

describe('Public auth forms', () => {
  const plugins = config.global.plugins
  beforeAll(() => {
    config.global.plugins = []
  })
  afterAll(() => {
    config.global.plugins = plugins
  })
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.currentUser = null
    mocks.route.path = '/public/login'
    mocks.route.query = { redirect: '/property/invitation' }
    mocks.firebase = {
      loading: ref(false),
      error: ref(''),
      isAuthenticated: ref(false),
      userEmail: ref(''),
      signIn: vi.fn().mockResolvedValue(undefined),
      resetPassword: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn(),
      signUp: vi.fn().mockResolvedValue({ user: { uid: 'new-user' } }),
      createDocument: vi.fn().mockResolvedValue(undefined),
    }
  })

  it('puts the form first and preserves password manager attributes and visibility', async () => {
    const wrapper = render(FirebaseAuth)
    expect(wrapper.get('.public-auth-frame').element.firstElementChild.className).toContain(
      'public-auth-card',
    )
    expect(wrapper.get('input[name="email"]').attributes('autocomplete')).toBe('username')
    expect(wrapper.get('input[name="password"]').attributes('autocomplete')).toBe(
      'current-password',
    )
    await wrapper.get('[aria-label="Show password"]').trigger('click')
    expect(wrapper.get('input[name="password"]').attributes('type')).toBe('text')
    await wrapper.get('[aria-label="Hide password"]').trigger('click')
    expect(wrapper.get('input[name="password"]').attributes('type')).toBe('password')
    wrapper.unmount()
  })

  it('hydrates the user store before opening the workspace and preserves the invitation target', async () => {
    const wrapper = render(FirebaseAuth)
    await wrapper.get('input[name="email"]').setValue('alex@example.test')
    await wrapper.get('input[name="password"]').setValue('secret123')
    mocks.firebase.signIn.mockImplementation(async () => {
      mocks.auth.currentUser = { uid: 'new-user' }
    })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(mocks.firebase.signIn).toHaveBeenCalledWith('alex@example.test', 'secret123')
    expect(mocks.setUser).toHaveBeenCalledWith({ uid: 'new-user' })
    expect(mocks.replace).toHaveBeenCalledWith({ path: '/loading', query: mocks.route.query })
    expect(mocks.setUser.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.replace.mock.invocationCallOrder[0],
    )
    wrapper.unmount()
  })

  it('prefills inline recovery, shows failures and returns to sign in after success', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = render(FirebaseAuth)
    await wrapper.get('input[name="email"]').setValue('alex@example.test')
    await button(wrapper, 'Forgot password?').trigger('click')
    expect(wrapper.get('h1').text()).toBe('Reset your password')
    expect(wrapper.get('input').element.value).toBe('alex@example.test')
    mocks.firebase.resetPassword.mockRejectedValueOnce(new Error('auth/network-request-failed'))
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Network error')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(mocks.firebase.resetPassword).toHaveBeenCalledWith('alex@example.test')
    expect(wrapper.get('h1').text()).toBe('Sign in')
    wrapper.unmount()
    vi.restoreAllMocks()
  })

  it('opens registration directly with four required fields and collapsed optional details', () => {
    const wrapper = render(RegisterLanding)
    expect(wrapper.get('h1').text()).toBe('Create your account')
    expect(wrapper.findAll('input[required]')).toHaveLength(4)
    expect(wrapper.get('details').attributes('open')).toBeUndefined()
    expect(wrapper.text()).not.toContain('Service Provider')
    wrapper.unmount()
  })

  it.each(['/property/invitation', '//external.example'])(
    'preserves the manager profile contract and safely handles redirect %s',
    async (redirect) => {
      mocks.route.query.redirect = redirect
      const wrapper = render(RegisterLanding)
      await populateSignup(wrapper)
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(mocks.firebase.signUp).toHaveBeenCalledWith(
        'alex@example.test',
        'secret123',
        'Alex Lee',
      )
      expect(mocks.firebase.createDocument).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({
          user_id: 'new-user',
          account_type: 'pm',
          account_type_locked: true,
          user_category: 'pm',
          manage_scope: ['Own'],
          owner_workspace_only: false,
          company_name: '',
          phone: '',
        }),
        'new-user',
      )
      expect(mocks.loadUserProfile).toHaveBeenCalledOnce()
      expect(mocks.push).toHaveBeenCalledWith(
        redirect.startsWith('//') ? '/loading' : { path: '/loading', query: { redirect } },
      )
      wrapper.unmount()
    },
  )

  it('keeps the form available and shows an error if registration fails', async () => {
    mocks.firebase.signUp.mockRejectedValueOnce(new Error('Account already exists'))
    const wrapper = render(RegisterLanding)
    await populateSignup(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Account already exists')
    expect(mocks.firebase.createDocument).not.toHaveBeenCalled()
    expect(mocks.push).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="pm-signup-submit"]').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
})
