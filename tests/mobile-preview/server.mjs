import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { applyInventoryCommand, createInventoryWorkflow } from '../../backend/inventoryWorkflow.js'
const root = fileURLToPath(new URL('../../', import.meta.url)),
  here = fileURLToPath(new URL('./', import.meta.url))
const actor = { id: 'pm1', email: 'pm@example.test' },
  now = '2026-09-08T12:00:00Z',
  signature = [
    [
      [0.1, 0.2],
      [0.4, 0.5],
      [0.8, 0.3],
    ],
  ]
let sequence = 0,
  state = createInventoryWorkflow(
    null,
    {
      property_id: 'p1',
      lease_id: 'l1',
      lease_label: 'Lease 2026',
      pm_user_id: 'pm1',
      pm_name: 'Alex Morgan',
      tenant_user_id: 'tt1',
      tenant_name: 'Taylor Lee',
    },
    now,
  )
function command(body, signer = actor) {
  state = applyInventoryCommand(
    state,
    { expected_revision: state.revision, ...body },
    signer,
    now,
    `event-${++sequence}`,
  )
}
command({ type: 'start', stage: 'move_in' })
for (const [id, name, area] of [
  ['fridge', 'Refrigerator', 'Kitchen'],
  ['oven', 'Oven', 'Kitchen'],
  ['carpet', 'Carpet', 'Living room'],
])
  command({
    type: 'save_item',
    new_item_id: id,
    entry: { name, area, condition: 'good', photos: [] },
  })
command({ type: 'sign', batch_version: 1, signature })
command({ type: 'sign', batch_version: 1, signature }, { id: 'tt1', email: 'tenant@example.test' })
const confirmed = structuredClone(state),
  property = { id: 'p1', nickname: 'Pinewood', address: '123 Pinewood Drive' }
const store = {
  user: { uid: 'pm1', email: 'pm@example.test' },
  userProfile: { account_type: 'pm', display_name: 'Alex Morgan' },
  userCategory: 'pm',
  accountType: 'pm',
  isManagerCapableUser: true,
  userAccessibleProperties: [property],
  userAccessibleMxRecords: [
    { id: 'task1', property_id: 'p1', task_title: 'Repair kitchen faucet', status: 'open' },
  ],
  userAccessibleLeases: [{ id: 'l1', property_id: 'p1', LSID: 'Lease 2026', status: 'Rented' }],
  userAccessibleTransactions: [],
  properties: [property],
  userRoles: [],
  leases: [],
  mxRecords: [],
}
const mocks = {
  'src/boot/firebase': `export const auth={currentUser:{uid:'pm1',email:'pm@example.test',getIdToken:async()=> 'fixture-token'}};export const authStateReady=Promise.resolve(auth.currentUser);export const authPersistenceReady=Promise.resolve();export const db={};export const storage={};export const app={};export const sessionManager={};`,
  'src/stores/userDataStore': `const store=${JSON.stringify(store)};for(const name of ['loadProperties','loadMxRecords','loadLeases','loadTransactions','loadUserProfile','setUser'])store[name]=async()=>{};export const useUserDataStore=()=>store;`,
  'src/composables/useFirebase': `export const useFirebase=()=>({getAllDocuments:async()=>[],getDocument:async()=>null});`,
}
const mockPlugin = {
  name: 'isolated-mobile-fixture',
  enforce: 'pre',
  resolveId(id) {
    if (mocks[id]) return '\0fixture:' + id
  },
  load(id) {
    if (id.startsWith('\0fixture:')) return mocks[id.slice(9)]
  },
  configureServer(server) {
    server.middlewares.use('/api', async (req, res) => {
      try {
        let raw = ''
        for await (const chunk of req) raw += chunk
        const body = raw ? JSON.parse(raw) : {},
          path = (req.url || '').split('?')[0]
        let payload = {}
        if (path.endsWith('/commands')) {
          command(body)
          payload = { inventory: state }
        } else if (path.endsWith('/inventory-workflow')) payload = { inventory: state }
        else if (path.endsWith('/notes')) payload = { items: [] }
        else if (path.endsWith('/history'))
          payload = { items: [{ ...confirmed.batch, history_id: 'first' }] }
        else if (path.endsWith('/leases')) payload = { leases: store.userAccessibleLeases }
        else if (path.endsWith('/credits')) payload = { balance: 42 }
        else if (path.endsWith('/usage'))
          payload = {
            ai_tokens_used: 120,
            ai_tokens_limit: 500,
            storage_used_mb: 4,
            storage_limit_mb: 512,
          }
        else {
          res.statusCode = 404
          payload = { message: 'This action is unavailable in the design fixture.' }
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(payload))
      } catch (err) {
        res.statusCode = err.status || 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ message: err.message, error_code: err.code }))
      }
    })
  },
}
mockPlugin.resolveId = (id) => {
  const key = id.replace(root, '').replace(/\.js$/, '')
  if (mocks[key]) return '\0fixture:' + key
}
const server = await createServer({
  configFile: false,
  root: here,
  envDir: here,
  plugins: [mockPlugin, vue()],
  resolve: {
    alias: {
      src: root + 'src',
      layouts: root + 'src/layouts',
      components: root + 'src/components',
      pages: root + 'src/pages',
    },
  },
  server: { host: '127.0.0.1', port: 9011, strictPort: true, fs: { allow: [root] } },
})
await server.listen()
server.printUrls()
