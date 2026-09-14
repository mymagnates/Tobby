import { chromium, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { applyInventoryCommand } from '../backend/inventoryWorkflow.js'

const output = '/private/tmp/handout-property-entries'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  const commandErrors = []
  const tenantFixture = {id:'tenant1',property_id:'p1',status:'active',personal_info:{first_name:'Taylor',last_name:'Example',email:'long.tenant.contact.address@example.test',phone:'555-0100',ssn:'123456789'},employment:{employer_name:'Example Company',position:'Designer'},emergency_contact:{name:'Alex Example',phone:'555-0200'},notes:'Fixture tenant notes for scroll verification.'}
  let populatedInventory = false
  let inventory = {revision:0,context:{property_id:'p1',lease_id:'l1',lease_label:'L-001',pm_user_id:'pm1',tenant_user_id:null,tenant_profile_id:'profile1',tenant_name:'Taylor Tenant'},batch:null,
    items:Array.from({length:40},(_,i)=>({id:`item-${i}`,name:`Fixture item ${i+1}`,area:'Rooms',closed:false,baseline:null,latest:null}))}
  page.on('pageerror', (error) => errors.push(error.message))
  // Isolated existing pages with simulated authentication/data; never saves records.
  await page.route('**/src/boot/firebase.js*', (route) => route.fulfill({ contentType: 'application/javascript', body:
    `export const auth={currentUser:{uid:'pm1',getIdToken:async()=> 'fixture'}}; export const authStateReady=Promise.resolve(); export const authPersistenceReady=Promise.resolve(); export const db={}; export const storage={}; export const app={}; export const sessionManager={}; export const FIRESTORE_LISTEN_DISABLED=true; export default ()=>{};` }))
  await page.route('**/src/boot/auth-init.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: 'export default ()=>{};' }))
  await page.route('**/src/router/routes.js*', (route) => route.fulfill({ contentType: 'application/javascript', body:
    `export default [{path:'/',component:()=>import('/tests/fixtures/PropertyEntryShell.vue'),children:[{path:'',component:()=>import('/src/pages/IndexPage.vue')},{path:'property-view',component:()=>import('/src/pages/PropertyView.vue')},{path:'inventory/:leaseId?',component:()=>import('/src/pages/InventoryListPage.vue')},{path:'leases',component:()=>import('/src/pages/LeasesPage.vue')},{path:'tenants',component:()=>import('/src/pages/TenantsPage.vue')}]}];` }))
  await page.route('**/src/stores/userDataStore.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: `
    const p={id:'p1',nickname:'Pinewood',address:'123 Pinewood Drive',spec:{bedroom:2,full_bathroom:1,half_bathroom:0,kitchen:1,living_room:1,dinning_area:1,garage:2},manager_user_ids:['pm1']};
    const store={user:{uid:'pm1'},userId:'pm1',userProfile:{account_type:'pm'},userCategory:'pm',accountType:'pm',isAuthenticated:true,isInitialized:true,isManagerCapableUser:true,loading:false,
    userRoles:[{role:'pm',property_id:'p1'}],properties:[p],userAccessibleProperties:[p],userAccessibleMxRecords:[],userAccessibleTransactions:[],userAccessibleLeases:[],mxRecords:[],transactions:[],leases:[],
    getUserRoleForProperty:()=>({role:'pm'}),getPropertyById:()=>p,getPropertyName:()=>p.nickname,canManageProperty:()=>true,canShareProperty:()=>false};
    for(const key of ['loadAllUserData','loadUserProfile','loadUserRoles','loadProperties','loadMxRecords','loadTransactions','loadLeases','setUser'])store[key]=async()=>{};
    if(location.pathname === '/leases') store.leases=store.userAccessibleLeases=[{id:'l1',LSID:'L-001',property_id:p,property_string_id:'p1',status:'Available',rate_amount:2700,deposit:1000,lease_start_date:'2026-09-01',lease_end_date:'2027-08-31'}];
    export const useUserDataStore=()=>store;` }))
  await page.route('**/src/composables/useFirebase.js*', (route) => route.fulfill({ contentType: 'application/javascript', body:
    `import {ref} from '/node_modules/vue/dist/vue.runtime.esm-bundler.js'; export const useFirebase=()=>({getAllDocuments:async()=>[],getDocument:async()=>null,getCollectionData:async()=>[],loading:ref(false),userId:ref('pm1')});` }))
  await page.route('**/api/**', (route) => {
    if (populatedInventory && route.request().url().endsWith('/inventory-workflow/commands')) {
      try {
        inventory = applyInventoryCommand(inventory, route.request().postDataJSON(), {id:'pm1'}, new Date().toISOString(), crypto.randomUUID())
        return route.fulfill({json:{inventory}})
      } catch (error) {
        commandErrors.push(`${route.request().postDataJSON().type}: ${error.message}`)
        console.error(`Fixture inventory command rejected: ${commandErrors.at(-1)}`)
        return route.fulfill({status:error.status || 400,json:{error:error.message,message:error.message,code:error.code}})
      }
    }
    return route.fulfill({ json: route.request().url().endsWith('/deposit')
    ? {currency:'USD',summary:{expected:1000,received:0,refunded:0,deducted:0,balance:0,status:'not_received'},entries:[]}
    : {inventory:populatedInventory ? inventory : null,rows:route.request().url().endsWith('/tenants') ? [tenantFixture] : [],documents:[],tenants:[tenantFixture]} })
  })
  await page.goto('http://localhost:9000/property-view')
  const workspace = page.locator('.property-workspace')
  await expect(workspace).toBeVisible()
  for (const kind of ['transaction','task','lease','reminder','service','document','asset']) {
    const button = workspace.getByRole('button', { name: `Create ${kind}`, exact: true }).last()
    await expect(button).toBeVisible()
    await button.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Pinewood')
    if (kind === 'lease') {
      const form = dialog.locator('.create-lease')
      await expect(form.locator('.lease-property-details')).not.toHaveAttribute('open', '')
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 })
        await expect(form.locator('.lease-optional-settings')).not.toHaveAttribute('open', '')
        if (await form.evaluate(el => el.scrollWidth > el.clientWidth + 1)) throw new Error('Create Lease overflows')
        await expect(page.locator('[class*="-enter-active"]')).toHaveCount(0)
        await page.screenshot({path:`${output}/create-lease-${width}.png`})
        await form.locator('.lease-optional-settings > summary').click()
        await form.getByLabel('Pet Fee', {exact:true}).fill('75')
        await form.locator('.lease-optional-settings > summary').click()
        await form.locator('.lease-optional-settings > summary').click()
        await expect(form.getByLabel('Pet Fee', {exact:true})).toHaveValue('75')
        await form.locator('.lease-optional-settings > summary').click()
      }
      await page.setViewportSize({ width: 1280, height: 900 })
    }
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).first().click()
    await expect(dialog).toHaveCount(0)
  }
  await page.screenshot({ path: `${output}/property-desktop.png`, fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: `${output}/property-small.png`, fullPage: true })
  await page.goto('http://localhost:9000/?propertyId=p1')
  const actions = page.getByLabel('Create a new record', { exact: true })
  await expect(actions).toBeVisible()
  const labels = await actions.getByRole('button').allTextContents()
  if (labels.findIndex((value) => value.includes('+Lease')) !== labels.findIndex((value) => value.includes('+Document')) + 1) throw new Error('Lease must follow Document')
  await actions.getByRole('button', { name: '+Lease', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('Pinewood')
  await page.screenshot({ path: `${output}/home-lease.png`, fullPage: true })
  await page.getByRole('dialog').getByRole('button',{name:'Cancel',exact:true}).click()
  await actions.getByRole('button',{name:'Inventory List',exact:true}).click()
  await expect(page.locator('.inventory-lease-picker')).toBeVisible()
  await page.getByRole('button',{name:'Close inventory lists',exact:true}).click()
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://localhost:9000/leases')
    const viewButton = page.locator('.lease-card').getByRole('button',{name:'View',exact:true})
    await viewButton.hover()
    const beforeView = await viewButton.boundingBox()
    await viewButton.click()
    await expect(page.locator('.lease-detail-card')).toBeVisible()
    await page.locator('.detail-shell-actions .q-btn').click()
    await expect(page.locator('.detail-shell-layer')).toHaveCount(0)
    const afterView = await viewButton.boundingBox()
    for (const key of ['x','y','width','height']) if (Math.abs(beforeView[key] - afterView[key]) > 1)
      throw new Error(`View button moved after opening details: ${JSON.stringify({beforeView,afterView})}`)
    await page.goto('http://localhost:9000/leases?openType=lease&openId=l1')
    const detail = page.locator('.lease-detail-card')
    await expect(detail).toBeVisible()
    await expect(detail.getByRole('button', {name:'Create Tenant',exact:true})).toBeVisible()
    if (await detail.evaluate(el => el.scrollWidth > el.clientWidth + 1)) throw new Error('Lease detail overflows horizontally')
    await page.screenshot({path:`${output}/lease-${width}.png`,fullPage:true})
    await detail.getByText('Lease End Date',{exact:true}).scrollIntoViewIfNeeded()
    await expect(detail.getByText('Lease End Date',{exact:true})).toBeInViewport()
    await page.screenshot({path:`${output}/lease-terms-${width}.png`,fullPage:true})
    await detail.getByRole('button', {name:'Documents',exact:true}).click()
    await expect(page.locator('.lease-documents')).toBeVisible()
    await expect(page.locator('[class*="-enter-active"]')).toHaveCount(0)
    await page.screenshot({path:`${output}/lease-documents-${width}.png`,fullPage:true})
    await page.locator('.lease-documents .dialog-close-btn').click()
    await detail.getByRole('button', {name:'Inventory',exact:true}).click()
    await expect(page.getByRole('button', {name:'Add first item',exact:true})).toBeVisible()
    await expect(page.locator('[class*="-enter-active"]')).toHaveCount(0)
    await page.screenshot({path:`${output}/lease-inventory-${width}.png`,fullPage:true})
  }
  populatedInventory = true
  for (const width of [1280,664,390]) {
    await page.setViewportSize({width,height:900})
    await page.goto('http://localhost:9000/leases')
    await page.locator('.lease-card').getByRole('button',{name:'Inventory List',exact:true}).click()
    const panel=page.locator('.inventory-web-dialog')
    await expect(panel.locator('.inventory-group .ios-row')).toHaveCount(inventory.items.length)
    const spacing = await panel.evaluate(el => {
      const list = el.querySelector('.inventory-workspace').getBoundingClientRect()
      const card = el.getBoundingClientRect()
      const row = el.querySelector('.inventory-group .ios-row').getBoundingClientRect()
      return { left: list.left - card.left, right: card.right - list.right, rowHeight: row.height }
    })
    if (spacing.left < 16 || spacing.right < 16 || spacing.rowHeight < 44 || spacing.rowHeight > 56)
      throw new Error(`Inventory insets/compact rows regressed: ${JSON.stringify(spacing)}`)
    await expect(page.locator('[class*="-enter-active"]')).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    const dimensions=await panel.evaluate(el=>({width:el.getBoundingClientRect().width,viewport:innerWidth,overflow:el.scrollWidth>el.clientWidth+1}))
    await page.screenshot({path:`${output}/inventory-items-${width}.png`})
    if(dimensions.width<dimensions.viewport-80 || dimensions.overflow) throw new Error(`Inventory should fill its content area without overflow: ${JSON.stringify(dimensions)}`)
    await panel.locator('.inventory-group .ios-row').last().scrollIntoViewIfNeeded()
    await expect(panel.locator('.inventory-group .ios-row').last()).toBeInViewport()
    await panel.getByRole('button',{name:'Add item',exact:true}).scrollIntoViewIfNeeded()
    await expect(panel.getByRole('button',{name:'Continue',exact:true})).toHaveCount(0)
    await panel.getByRole('button',{name:'Add item',exact:true}).click()
    await panel.getByLabel('Item name',{exact:true}).fill(`Added on ${width}`)
    await panel.getByRole('button',{name:'Save item',exact:true}).click()
    await panel.getByRole('button',{name:'Signatures',exact:true}).click()
    await expect(panel.locator('.inventory-signatures')).toBeInViewport()
    await expect(panel.locator('.ios-review-entry')).toHaveCount(0)
    await expect(panel.getByRole('button',{name:'Sign entire list',exact:true})).toBeEnabled()
    await panel.getByRole('button',{name:'Tenant signs on this device',exact:true}).click()
    await expect(page.getByRole('heading',{name:'Tenant signature',exact:true})).toBeVisible()
    await expect(page.getByText('Taylor Tenant',{exact:true}).last()).toBeVisible()
    const canvas = page.getByLabel('Draw your signature',{exact:true})
    await expect(page.locator('[class*="-enter-active"]')).toHaveCount(0)
    const bounds = await canvas.boundingBox()
    await page.screenshot({path:`${output}/inventory-signature-${width}.png`})
    if(bounds.width < 240 || bounds.height < 190) throw new Error(`Signature pad too small: ${JSON.stringify(bounds)}`)
    await page.mouse.move(bounds.x+25,bounds.y+70)
    await page.mouse.down()
    await page.mouse.move(bounds.x+100,bounds.y+130,{steps:12})
    const inkWhileDrawing = await canvas.evaluate(el => {
      const pixels = el.getContext('2d').getImageData(0,0,el.width,el.height).data
      return { width: el.width, height: el.height, ink: pixels.some((v,i) => i % 4 === 3 && v > 0) }
    })
    if (!inkWhileDrawing.ink) throw new Error(`Signature has no visible ink while drawing: ${JSON.stringify(inkWhileDrawing)}`)
    await page.mouse.up()
    await expect(page.getByRole('button',{name:'Undo last stroke',exact:true})).toBeEnabled()
    await page.getByRole('checkbox').last().check()
    await expect(page.getByRole('button',{name:'Confirm & sign',exact:true})).toBeEnabled()
    await page.getByRole('button',{name:'Undo last stroke',exact:true}).click()
    await expect(page.getByRole('button',{name:'Confirm & sign',exact:true})).toBeDisabled()
    await page.getByRole('button',{name:'Use trackpad mode (no holding)',exact:true}).click()
    const trackpadBounds = await canvas.boundingBox()
    await page.mouse.click(trackpadBounds.x+30,trackpadBounds.y+60)
    await page.mouse.move(trackpadBounds.x+130,trackpadBounds.y+100,{steps:15})
    await page.mouse.click(trackpadBounds.x+130,trackpadBounds.y+100)
    await expect(page.getByRole('button',{name:'Confirm & sign',exact:true})).toBeEnabled()
    await page.getByRole('button',{name:'Clear signature',exact:true}).click()
    await expect(page.getByRole('button',{name:'Confirm & sign',exact:true})).toBeDisabled()
    if (width === 390) {
      const touchBox = await canvas.boundingBox()
      await canvas.dispatchEvent('pointerdown',{pointerId:99,pointerType:'touch',button:0,clientX:touchBox.x+30,clientY:touchBox.y+40})
      for (let i=1;i<=8;i++) await canvas.dispatchEvent('pointermove',{pointerId:99,pointerType:'touch',clientX:touchBox.x+30+i*12,clientY:touchBox.y+40+i*8})
      const touchInk = await canvas.evaluate(el => el.getContext('2d').getImageData(0,0,el.width,el.height).data.some((v,i)=>i%4===3 && v>0))
      if (!touchInk) throw new Error('No visible ink during touch drawing')
      await canvas.dispatchEvent('pointerup',{pointerId:99,pointerType:'touch'})
      await expect(page.getByRole('button',{name:'Confirm & sign',exact:true})).toBeEnabled()
      await page.getByRole('button',{name:'Clear signature',exact:true}).click()
    }
    await page.screenshot({path:`${output}/inventory-signature-${width}.png`})
    await page.getByRole('button',{name:'Cancel',exact:true}).last().click()
    await expect(panel.getByRole('button',{name:/To check|Mark unchanged/})).toHaveCount(0)
    await panel.getByRole('button',{name:'Close inventory',exact:true}).click()
    await expect(page).toHaveURL(/\/leases$/)
  }
  for (const width of [1280,390]) {
    await page.setViewportSize({width,height:900})
    await page.goto('http://localhost:9000/tenants')
    await page.locator('.tenant-card').first().click()
    const detail = page.locator('.tenant-detail-dialog')
    await expect(detail.getByRole('button',{name:'Edit tenant',exact:true})).toBeVisible()
    await expect(page.locator('[class*="-enter-active"]')).toHaveCount(0)
    if(await detail.evaluate(el=>el.scrollWidth>el.clientWidth+1)) throw new Error('Tenant details overflow')
    await page.screenshot({path:`${output}/tenant-detail-${width}.png`})
    await expect(detail).not.toContainText('123456789')
    await expect(detail).toContainText('***-**-6789')
    await detail.getByText(tenantFixture.notes,{exact:true}).scrollIntoViewIfNeeded()
    await expect(detail.getByRole('button',{name:'Close tenant details',exact:true})).toBeInViewport()
    await detail.getByRole('button',{name:'Edit tenant',exact:true}).click()
    await expect(detail.getByLabel('First Name *',{exact:true})).toHaveValue('Taylor')
    await detail.getByRole('button',{name:'Close tenant details',exact:true}).click()
  }
  // Replace only the in-memory fixture after all original 40-item/signature flows.
  const moveOutFailures = []
  for (const width of [1280,664,390]) {
    try {
      inventory = {revision:0,context:inventory.context,batch:null,move_in_confirmed:true,rooms:['Utility closet'],items:[
        {id:'bed',name:'Bedroom lamp',area:'Bedroom 1',kind:'item'},
        {id:'oven',name:'Kitchen oven',area:'Kitchen',kind:'item'},
      ].map(item => ({...item,closed:false,baseline:{...item,condition:'good',note:'Original move-in evidence',photos:[],stage:'move_in',batch_id:'fixture-move-in'},latest:{...item,condition:'worn',note:'Later inspection reference',photos:[],stage:'inspection',batch_id:'fixture-inspection'}}))}
      const originalBaselines = structuredClone(inventory.items.map(item => item.baseline))
      await page.setViewportSize({width,height:900})
      await page.goto('http://localhost:9000/leases')
      await page.locator('.lease-card').getByRole('button',{name:'Inventory List',exact:true}).click()
      const panel = page.locator('.inventory-web-dialog')
      await panel.getByRole('button',{name:'Add key / access',exact:true}).click()
      await panel.getByLabel('Item name',{exact:true}).fill('Front door keys')
      const room = panel.getByRole('combobox',{name:'Room / area',exact:true})
      await room.click()
      for (const name of ['Bedroom 1','Bedroom 2','Full Bathroom','Kitchen','Living Room','Dining Area','Garage','Utility closet','Other'])
        await expect(page.getByRole('option',{name,exact:true})).toBeVisible()
      for (const name of ['Bedroom 3','Half Bathroom','Garage 1','Garage 2'])
        await expect(page.getByRole('option',{name,exact:true})).toHaveCount(0)
      await page.screenshot({path:`${output}/inventory-room-options-${width}.png`})
      await page.getByRole('option',{name:'Bedroom 2',exact:true}).click()
      await panel.getByLabel('Quantity provided / currently held',{exact:true}).fill('3')
      await panel.getByRole('button',{name:'Save item',exact:true}).click()
      await expect(panel.getByRole('button',{name:'Add key / access',exact:true})).toBeVisible()
      const access = inventory.batch.entries.find(entry => entry.name === 'Front door keys')
      expect(access).toMatchObject({kind:'access',quantity:3,area:'Bedroom 2'})
      expect(inventory.items.slice(0,2).map(item => item.baseline)).toEqual(originalBaselines)

      // Confirm the synthetic list with the real reducer, never a live API or real signature.
      for (const signer_role of ['pm','tenant']) inventory = applyInventoryCommand(inventory, {
        type:'sign',expected_revision:inventory.revision,batch_version:inventory.batch.version,
        signer_role,capture_method:signer_role === 'tenant' ? 'in_person' : 'authenticated',
        signature:[[[0.1,0.2],[0.3,0.4],[0.5,0.2]]],
      },{id:'pm1'},'2026-09-13T12:00:00.000Z',`fixture-sign-${signer_role}`)
      const confirmedItems = structuredClone(inventory.items)
      await panel.getByRole('button',{name:'Refresh',exact:true}).click()
      await expect(panel.locator('.inventory-list-actions')).toContainText('Both confirmed')
      await panel.getByRole('button',{name:'Start move-out',exact:true}).click()
      const checklist = panel.locator('.move-out-checklist')
      await expect(checklist).toBeVisible()
      await expect(checklist.locator('.move-out-room')).toHaveCount(3)
      await expect(checklist.locator('tbody tr')).toHaveCount(3)
      await expect(panel.locator('.ios-review-entry')).toHaveCount(0)
      for (const area of ['Bedroom 1','Kitchen','Bedroom 2'])
        await expect(checklist.getByRole('heading',{name:new RegExp(`^${area} `)})).toBeVisible()
      const sign = panel.getByRole('button',{name:'Sign entire list',exact:true})
      const tenantSign = panel.getByRole('button',{name:'Tenant signs on this device',exact:true})
      const expectSigningBlocked = async label => {
        for (const button of [sign,tenantSign]) {
          try { await expect(button).toBeDisabled({timeout:1000}) }
          catch { moveOutFailures.push(`${width}px: ${label}: ${await button.innerText()} is enabled`) }
        }
      }
      await expectSigningBlocked('0/3 checked')
      const entryFor = id => inventory.batch.entries.find(entry => entry.item_id === id)
      const keyRow = checklist.locator(`tr[data-item-id="${access.item_id}"]`)
      const keyCheck = keyRow.getByRole('checkbox')
      const count = keyRow.getByRole('spinbutton',{name:'Actual count for Front door keys',exact:true})
      await expect(count).toHaveValue('')
      await expect(keyCheck).toBeDisabled()
      // Select an actual condition while the count is still null: valid draft, not reviewable.
      await keyRow.getByRole('combobox',{name:'Move-out condition for Front door keys',exact:true}).click()
      await page.getByRole('option',{name:'Good',exact:true}).click()
      await expect.poll(() => entryFor(access.item_id).condition).toBe('good')
      expect(entryFor(access.item_id).quantity).toBeNull()
      await expect(keyCheck).toBeDisabled()
      expect(() => applyInventoryCommand(inventory,{type:'review_item',item_id:access.item_id,expected_revision:inventory.revision},{id:'pm1'},'2026-09-13T12:00:00.000Z','fixture-invalid-review')).toThrow(/quantity/i)
      expect(() => applyInventoryCommand(inventory,{type:'sign',expected_revision:inventory.revision,batch_version:inventory.batch.version,signature:[[[0.1,0.2],[0.3,0.4],[0.5,0.2]]]},{id:'pm1'},'2026-09-13T12:00:00.000Z','fixture-invalid-sign')).toThrow(/review every item/i)
      await count.fill('2')
      await count.press('Tab')
      await expect.poll(() => entryFor(access.item_id).quantity).toBe(2)
      await expect(keyCheck).toBeEnabled()
      await expect(keyCheck).not.toBeChecked()
      await expect(keyRow).toContainText('Count differs: 3 → 2')
      await keyCheck.click()
      await expect.poll(() => entryFor(access.item_id).checked).toBe(true)
      await expect(keyCheck).toBeChecked()
      await count.fill('')
      await count.press('Tab')
      await expect.poll(() => entryFor(access.item_id).quantity).toBeNull()
      await expect(keyCheck).not.toBeChecked()
      await expect(keyCheck).toBeDisabled()
      await expectSigningBlocked('access count cleared')
      await count.fill('0')
      await count.press('Tab')
      await expect.poll(() => entryFor(access.item_id).quantity).toBe(0)
      await keyCheck.click()
      await expect(keyCheck).toBeChecked()
      for (const id of ['bed','oven']) {
        const row = checklist.locator(`tr[data-item-id="${id}"]`)
        await expect(row.getByRole('checkbox')).toBeDisabled()
        await row.getByRole('button',{name:'Use reference condition',exact:true}).click()
        await expect(row.getByRole('checkbox')).toBeEnabled()
        await expect(row.getByRole('checkbox')).not.toBeChecked()
        await expectSigningBlocked(`before checking ${id}`)
        await row.getByRole('checkbox').click()
        await expect.poll(() => entryFor(id).checked).toBe(true)
        await expect(row.getByRole('checkbox')).toBeChecked()
      }
      await expect(sign).toBeEnabled()
      await expect(tenantSign).toBeEnabled()
      await checklist.getByRole('button',{name:'Signatures',exact:true}).click()
      await expect(panel.locator('.inventory-signatures')).toBeInViewport()
      await sign.click()
      await expect(page.getByRole('heading',{name:'PM signature',exact:true})).toBeVisible()
      await expect(page.getByRole('button',{name:'Confirm & sign',exact:true})).toBeDisabled()
      await page.getByRole('button',{name:'Cancel',exact:true}).last().click()
      await keyCheck.click()
      await expect(keyCheck).not.toBeChecked()
      await expectSigningBlocked('explicit check removed')
      expect(inventory.batch.signatures).toEqual({})
      expect(inventory.items).toEqual(confirmedItems)
      expect(inventory.items.slice(0,2).map(item => item.baseline)).toEqual(originalBaselines)
      expect(inventory.batch.entries.every(entry => entry.photos.length === 0)).toBe(true)
      if (await checklist.evaluate(el => el.scrollWidth > el.clientWidth + 1)) throw new Error('Move-out checklist overflows')
      await checklist.scrollIntoViewIfNeeded()
      await page.screenshot({path:`${output}/inventory-moveout-${width}.png`})
      console.log(`Inventory keys/rooms/move-out assertions completed at ${width}px; recorded failures: ${moveOutFailures.filter(message => message.startsWith(`${width}px:`)).length}`)
    } catch (error) {
      await page.screenshot({path:`${output}/inventory-moveout-failure-${width}.png`})
      moveOutFailures.push(`${width}px: ${error.message}`)
    }
  }
  if (errors.length || commandErrors.length || moveOutFailures.length) throw new Error([...errors,...commandErrors,...moveOutFailures].join('\n'))
  console.log(`Property creation entry checks passed: ${output}`)
} finally { await browser.close() }
