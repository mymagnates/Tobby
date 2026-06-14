<template>
  <section>
    <div class="filter-row panel">
      <select v-model="filters.status">
        <option value="">All status</option>
        <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
      </select>
      <select v-model="filters.category">
        <option value="">All categories</option>
        <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
      </select>
      <select v-model="filters.priority">
        <option value="">All priorities</option>
        <option v-for="priority in priorityOptions" :key="priority" :value="priority">{{ priority }}</option>
      </select>
      <input v-model="filters.assigned_to" placeholder="assigned_to" />
      <input v-model="filters.q" placeholder="Search subject, user, ticket" />
      <button class="primary" @click="loadTickets">Search</button>
    </div>

    <div class="row">
      <div class="col panel table-wrap">
        <div class="support-counters">
          <span v-for="status in statusOptions" :key="status" class="badge ok">
            {{ status }}: {{ counters[status] || 0 }}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>ticket</th>
              <th>subject</th>
              <th>category</th>
              <th>status</th>
              <th>priority</th>
              <th>assigned</th>
              <th>updated</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in tickets" :key="ticket.id">
              <td><a href="#" @click.prevent="openTicket(ticket.id)">{{ ticket.id }}</a></td>
              <td>{{ ticket.subject }}</td>
              <td>{{ ticket.category }}</td>
              <td>{{ ticket.status }}</td>
              <td>{{ ticket.priority }}</td>
              <td>{{ ticket.assigned_to || 'unassigned' }}</td>
              <td>{{ ticket.updated_at }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col panel" v-if="selected.ticket">
        <div class="ticket-header">
          <h3>{{ selected.ticket.subject }}</h3>
          <button @click="closeDetail">Close</button>
        </div>
        <p><strong>ID:</strong> {{ selected.ticket.id }}</p>
        <p><strong>User:</strong> {{ selected.ticket.user_id }} / {{ selected.ticket.user_role }}</p>
        <p><strong>Related:</strong> {{ selected.ticket.related_entity_type || '-' }} {{ selected.ticket.related_entity_id || '' }}</p>

        <div class="filter-row">
          <select v-model="form.status">
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
          <select v-model="form.category">
            <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
          </select>
          <select v-model="form.priority">
            <option v-for="priority in priorityOptions" :key="priority" :value="priority">{{ priority }}</option>
          </select>
          <input v-model="form.assigned_to" placeholder="assigned_to" />
        </div>

        <div class="flag-row">
          <label><input v-model="form.needs_billing_review" type="checkbox" /> billing</label>
          <label><input v-model="form.needs_backend_fix" type="checkbox" /> backend</label>
          <label><input v-model="form.needs_frontend_fix" type="checkbox" /> frontend</label>
          <label><input v-model="form.needs_ios_fix" type="checkbox" /> iOS</label>
        </div>

        <div class="filter-row">
          <input v-model="form.related_entity_type" placeholder="related_entity_type" />
          <input v-model="form.related_entity_id" placeholder="related_entity_id" />
          <button class="primary" @click="saveTicket">Save</button>
        </div>

        <h4>Thread</h4>
        <div class="thread">
          <div v-for="comment in selected.comments" :key="comment.id" class="comment" :class="{ internal: comment.internal }">
            <strong>{{ comment.author_type }}</strong>
            <span>{{ comment.created_at }}</span>
            <p>{{ comment.body }}</p>
          </div>
        </div>

        <textarea v-model="comment.body" rows="5" placeholder="Reply or internal note"></textarea>
        <div class="filter-row">
          <button class="primary" @click="sendReply">Send Reply</button>
          <button @click="requestMoreInfo">Request Info</button>
          <button @click="addInternalNote">Internal Note</button>
          <button class="success" @click="setStatus('resolved')">Resolve</button>
          <button @click="setStatus('closed')">Close</button>
        </div>
      </div>
    </div>

    <p v-if="message" style="margin-top: 8px">{{ message }}</p>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '../services/adminApi'

const route = useRoute()
const router = useRouter()

const statusOptions = ['open', 'triaged', 'in_progress', 'waiting_on_user', 'resolved', 'closed']
const categoryOptions = ['account', 'task_lead', 'payment_credit', 'bug']
const priorityOptions = ['low', 'normal', 'high', 'urgent']

const tickets = ref([])
const counters = ref({})
const message = ref('')
const selected = reactive({ ticket: null, comments: [] })

const filters = reactive({
  status: '',
  category: '',
  priority: '',
  assigned_to: '',
  q: '',
})

const form = reactive({
  status: 'open',
  category: 'bug',
  priority: 'normal',
  assigned_to: '',
  related_entity_type: '',
  related_entity_id: '',
  needs_billing_review: false,
  needs_backend_fix: false,
  needs_frontend_fix: false,
  needs_ios_fix: false,
})

const comment = reactive({ body: '' })

const hydrateForm = (ticket) => {
  form.status = ticket.status || 'open'
  form.category = ticket.category || 'bug'
  form.priority = ticket.priority || 'normal'
  form.assigned_to = ticket.assigned_to || ''
  form.related_entity_type = ticket.related_entity_type || ''
  form.related_entity_id = ticket.related_entity_id || ''
  form.needs_billing_review = Boolean(ticket.needs_billing_review)
  form.needs_backend_fix = Boolean(ticket.needs_backend_fix)
  form.needs_frontend_fix = Boolean(ticket.needs_frontend_fix)
  form.needs_ios_fix = Boolean(ticket.needs_ios_fix)
}

const loadTickets = async () => {
  const res = await adminApi.listSupportTickets({ ...filters, limit: 150 })
  tickets.value = res.items || []
  counters.value = res.counters || {}
}

const openTicket = async (ticketId) => {
  const res = await adminApi.getSupportTicket(ticketId)
  selected.ticket = res.ticket
  selected.comments = res.comments || []
  hydrateForm(res.ticket)
  router.replace(`/support/${ticketId}`)
}

const closeDetail = () => {
  selected.ticket = null
  selected.comments = []
  router.replace('/support')
}

const saveTicket = async () => {
  if (!selected.ticket) return
  const res = await adminApi.updateSupportTicket(selected.ticket.id, { ...form })
  selected.ticket = res.ticket
  hydrateForm(res.ticket)
  message.value = 'Ticket updated.'
  await loadTickets()
}

const setStatus = async (status) => {
  form.status = status
  await saveTicket()
}

const addComment = async (payload) => {
  if (!selected.ticket) return
  await adminApi.addSupportComment(selected.ticket.id, payload)
  comment.body = ''
  await openTicket(selected.ticket.id)
  await loadTickets()
}

const sendReply = () => addComment({ body: comment.body, internal: false })
const requestMoreInfo = () => addComment({ body: comment.body, internal: false, request_more_info: true })
const addInternalNote = () => addComment({ body: comment.body, internal: true })

watch(
  () => route.params.ticketId,
  (ticketId) => {
    if (ticketId) openTicket(String(ticketId))
  },
)

onMounted(async () => {
  await loadTickets()
  if (route.params.ticketId) await openTicket(String(route.params.ticketId))
})
</script>
