<template>
  <q-page class="mobile-page mobile-page--with-primary-action">
    <div class="mobile-page-stack">
      <MobilePageHeader eyebrow="PM" title="Tobby AI" description="Structured drafts using the same boundaries as the web assistant." />

      <MobileCard title="Ask Tobby" subtitle="Draft task, transaction, asset, reminder, or service records.">
        <q-input
          v-model="prompt"
          type="textarea"
          autogrow
          outlined
          dense
          placeholder="Describe what happened, what was paid, or what needs follow-up."
        />
      </MobileCard>

      <MobileCard title="Supported drafts">
        <div class="mobile-list">
          <div v-for="item in draftTypes" :key="item.title" class="mobile-list-row">
            <div class="mobile-list-row__icon"><q-icon :name="item.icon" size="21px" /></div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">{{ item.title }}</div>
              <div class="mobile-list-row__meta">{{ item.meta }}</div>
            </div>
          </div>
        </div>
      </MobileCard>

      <MobileCard title="Boundary" subtitle="The mobile assistant follows the web assistant scope.">
        <div class="mobile-list">
          <div class="mobile-list-row">
            <div class="mobile-list-row__icon"><q-icon name="verified_user" size="21px" /></div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">Review before save</div>
              <div class="mobile-list-row__meta">Tobby opens forms with drafts and never writes directly.</div>
            </div>
          </div>
          <div class="mobile-list-row">
            <div class="mobile-list-row__icon"><q-icon name="report" size="21px" /></div>
            <div class="mobile-list-row__body">
              <div class="mobile-list-row__title">No DIY repair advice</div>
              <div class="mobile-list-row__meta">Task insight explains issue meaning and urgency only.</div>
            </div>
          </div>
        </div>
      </MobileCard>
    </div>

    <div class="mobile-primary-action">
      <q-btn unelevated no-caps color="primary" class="full-width" label="Generate Draft" />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import MobileCard from 'components/mobile/MobileCard.vue'
import MobilePageHeader from 'components/mobile/MobilePageHeader.vue'

const prompt = ref('')

const draftTypes = [
  { icon: 'task_alt', title: 'Task draft', meta: 'Create task form review required' },
  { icon: 'payments', title: 'Transaction draft', meta: 'Property and role rules matched locally' },
  { icon: 'event', title: 'Reminder draft', meta: 'Category and repeat options normalized' },
  { icon: 'handyman', title: 'Service draft', meta: 'PM/Admin capability only' },
  { icon: 'chair', title: 'Asset draft', meta: 'Type and location hints resolved locally' },
]
</script>
