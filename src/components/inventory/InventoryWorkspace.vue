<template>
  <div class="inventory-workspace">
    <WorkspaceHeader
      :title="
        screen === 'item'
          ? editing
            ? draft.name || 'New item'
            : selectedItem?.name || 'Item'
          : screen === 'move_out' ? 'Move-out checklist' : screen === 'batch'
            ? 'Inventory history'
            : 'Inventory List'
      "
      back
      @back="back"
    >
      <q-btn
        v-if="
          screen === 'item' &&
          selectedItem &&
          !editing &&
          canEdit &&
          pendingEntry(selectedItem.id)?.action !== 'close'
        "
        flat
        no-caps
        label="Edit"
        @click="editItem(selectedItem)"
      />
      <q-btn flat round icon="close" aria-label="Close inventory" :disable="busy" @click="closeWorkspace" />
    </WorkspaceHeader>
    <div v-if="state" class="ios-context">
      <span>{{ propertyLabel }} · {{ state.context.lease_label }}</span
      ><q-btn
        flat
        round
        icon="info_outline"
        aria-label="Lease and participants"
        @click="contextOpen = true"
      />
    </div>
    <q-linear-progress v-if="loading" indeterminate aria-label="Loading inventory" />
    <div v-if="error" class="ios-error" role="alert">
      {{ error
      }}<q-btn flat no-caps label="Reload list" :disable="busy" @click="reloadPreservingDraft" />
    </div>
    <template v-if="!loading && !state && !error && workflowReady">
      <div class="ios-empty">No inventory list for this lease yet.</div>
      <q-btn
        v-if="!tenantReview"
        class="ios-primary full-width"
        unelevated
        no-caps
        label="Add first item"
        :loading="busy"
        @click="newItem"
      />
      <q-btn v-if="!tenantReview" flat no-caps label="Start move-in list" :disable="busy" @click="startMoveIn" />
    </template>
    <template v-if="state && screen === 'list'">
      <div v-if="workflowReady" class="inventory-list-actions">
        <div><strong>{{ activeItems.length }} items · {{ batch ? statusLabel(batch.status) : 'Draft' }}</strong>
          <p>Add items, then both parties sign below.</p>
        </div>
        <q-btn outline no-caps icon="add" label="Add item" :disable="busy" @click="newItem" />
        <q-btn flat no-caps icon="key" label="Add key / access" :disable="busy" @click="newAccessItem" />
        <q-btn flat no-caps icon="refresh" label="Refresh" :disable="busy || loading" @click="reloadPreservingDraft" />
        <q-btn flat no-caps label="Signatures" :disable="busy || !activeItems.length" @click="showSignatures" />
        <q-btn outline no-caps :label="isMoveOut ? 'View move-out' : 'Move-out check'" :disable="busy" @click="openMoveOut" />
        <q-btn v-if="!batch && !state.move_in_confirmed" flat no-caps label="Start move-in list" :disable="busy" @click="startMoveIn" />
      </div>
      <p v-if="batch && batch.status !== 'confirmed' && !isMoveOut" class="ios-muted">Move-out checks the same items. Any unfinished signing version will be kept in History when the PM proceeds.</p>
      <div class="inventory-filters">
        <div class="ios-segments" role="tablist">
        <button role="tab" :aria-selected="tab === 'items'" @click="tab = 'items'">Items</button
        ><button role="tab" :aria-selected="tab === 'history'" @click="openHistory">History</button>
        </div>
        <q-input v-if="tab === 'items'" v-model="search" dense borderless clearable label="Find an item"
          ><template #prepend><q-icon name="search" /></template
        ></q-input>
      </div>
      <template v-if="tab === 'items'">
        <section v-for="group in groups" :key="group.area" class="inventory-group">
          <div class="inventory-room-heading"><h2>{{ group.area }}</h2><q-btn v-if="workflowReady" flat no-caps icon="add" :aria-label="`Add item to ${group.area}`" label="Add" :disable="busy" @click="newItem(group.area)" /></div>
          <button
            v-for="item in group.items"
            :key="item.id"
            class="ios-row"
            @click="openItem(item)"
          >
            <img
              v-if="itemPhoto(item)"
              :src="itemPhoto(item)"
              :alt="item.name"
              width="52"
              height="52"
              style="object-fit: cover; border-radius: 6px"
            />
            <span class="ios-row-body"
              ><span class="ios-row-title">{{ pendingEntry(item.id)?.name || item.name }}</span
              ><span class="ios-row-meta inventory-item-condition">{{
                conditionLabel(pendingEntry(item.id)?.condition || item.latest?.condition || 'not_checked')
              }}</span>
              <span v-if="(pendingEntry(item.id) || item.latest)?.kind === 'access'" class="ios-row-meta">{{ batch?.stage === 'move_out' ? 'Returned' : 'Quantity' }}: {{ (pendingEntry(item.id) || item.latest).quantity ?? 'Not recorded' }}</span>
              <span v-if="pendingEntry(item.id)?.action === 'close'" class="ios-row-meta">Closure requested: {{ pendingEntry(item.id).closure.reason }}. Takes effect after both signatures.</span>
              <span v-if="(pendingEntry(item.id) || item.latest)?.note" class="inventory-item-note">{{ (pendingEntry(item.id) || item.latest).note }}</span>
              <span v-if="(pendingEntry(item.id)?.photos || item.latest?.photos || []).length > 1" class="inventory-item-photos">
                <img v-for="photo in (pendingEntry(item.id)?.photos || item.latest?.photos || []).slice(1)" :key="photo.path" :src="photo.url" :alt="item.name" width="44" height="44" />
              </span>
            </span
            >
            <q-icon name="chevron_right" size="20px" />
          </button>
        </section>
        <p v-if="!groups.length" class="ios-empty">
          {{ search ? 'No matching items.' : 'No items yet.' }}
        </p>
        <q-expansion-item v-if="closedItems.length" :label="`Closed items (${closedItems.length})`"
          ><button
            v-for="item in closedItems"
            :key="item.id"
            class="ios-row"
            @click="openItem(item)"
          >
            {{ item.name }}
          </button></q-expansion-item
        >
        <q-expansion-item v-if="state.legacy_keys" label="Imported keys & access (reference only)"
          ><div v-for="(counts, key) in state.legacy_keys" :key="key" class="ios-row">
            <span class="ios-row-body">{{ key.replaceAll('_', ' ') }}</span
            ><span class="ios-muted"
              >Received: {{ counts.received ?? 0 }} · Returned: {{ counts.returned ?? 0 }}</span
            >
          </div></q-expansion-item
        >
      </template>
      <template v-else>
        <button
          v-for="version in history"
          :key="version.history_id"
          class="ios-row"
          @click="openVersion(version)"
        >
          <span class="ios-row-body"
            ><span class="ios-row-title"
              >{{ version.scope === 'list' ? 'Inventory list' : stageLabel(version.stage) }} · v{{ version.version }}</span
            ><span class="ios-row-meta"
              >{{ date(version.created_at) }} · {{ statusLabel(version.status) }}</span
            ></span
          ><q-icon name="chevron_right" />
        </button>
        <p v-if="!history.length && !loading" class="ios-empty">No confirmation history yet.</p>
      </template>
    </template>
    <template v-if="state && screen === 'batch' && displayBatch">
      <div class="ios-context">
        <span
          >{{ statusLabel(displayBatch.status) }} · {{ displayBatch.entries.length }} items · v{{
            displayBatch.version
          }}</span
        >
      </div>
      <p v-if="historyVersion" class="ios-muted">
        Historical version. Signed content cannot be edited.
      </p>
      <p v-if="displayBatch.status === 'withdrawn'" class="ios-muted">Withdrawn when move-out began. Any signatures below belong to this withdrawn version, not the current checklist.</p>
      <p class="ios-muted">Review the whole list, then sign once. Changes after signing require both parties to sign the updated list again.</p>
      <div v-for="entry in displayedEntries" :key="entry.item_id" class="ios-review-entry">
        <component
          :is="historyVersion ? 'div' : 'button'"
          class="ios-row q-pa-none"
          style="border: 0"
          @click="openItemById(entry.item_id, !!historyVersion)"
        >
          <span class="ios-row-body"
            ><span class="ios-row-title">{{ entry.name }}</span
            ><span class="ios-row-meta"
              >{{ entry.area }} ·
              {{
                entry.action === 'close' ? 'Requested closure' : conditionLabel(entry.condition)
              }}</span>
              <span v-if="entry.kind === 'access'" class="ios-row-meta">{{ displayBatch.stage === 'move_out' ? 'Returned' : 'Provided / held' }}: {{ entry.quantity ?? 'Not recorded' }}</span>
            </span
          ><q-icon v-if="!historyVersion" name="chevron_right" />
        </component>
        <p v-if="entry.action === 'close'" class="ios-muted">
          {{ entry.closure.reason }} · Takes effect only after both signatures.
        </p>
        <p v-else-if="entry.note" class="q-my-sm">{{ entry.note }}</p>
        <p v-if="entry.unchanged_from" class="ios-muted">
          Unchanged from the previous confirmed record.
        </p>
        <div class="ios-photos">
          <button
            v-for="photo in entry.photos"
            :key="photo.path"
            class="ios-photo"
            style="padding: 0; border: 0; background: none"
            @click="lightbox = photo.url"
          >
            <img :src="photo.url" :alt="entry.name" />
          </button>
        </div>
      </div>
      <template v-if="!historyVersion && batch.status !== 'confirmed'">
        <q-btn flat no-caps icon="add" label="Add item" @click="newItem" />
        <q-btn
          v-if="batch.scope !== 'list' && batch.stage === 'inspection'"
          flat
          no-caps
          icon="playlist_add"
          label="Choose existing item"
          @click="chooseItemOpen = true"
        />
        <q-btn
          v-if="!historyVersion && !isMoveOut && batch.scope !== 'list' && unchangedCandidates.length"
          flat
          no-caps
          icon="done_all"
          label="Mark unchanged"
          @click="unchangedOpen = true"
        />
      </template>
    </template>
    <MoveOutChecklist v-if="screen === 'move_out' && isMoveOut"
      :entries="batch.entries" :conditions="conditions" :busy="busy" :readonly="batch.status === 'confirmed' || !workflowReady" :missing-move-in="batch.missing_move_in"
      @add="newItem" @add-access="newAccessItem" @edit="editMoveOutItem" @photo="lightbox = $event" @condition="saveMoveOutCondition" @quantity="saveMoveOutQuantity" @reference="useReference" @review="reviewMoveOutItem" @signatures="showSignatures" />
    <section v-if="state && ((screen === 'list' && tab === 'items' && activeItems.length && !isMoveOut) || screen === 'move_out' || (screen === 'batch' && historyVersion))" ref="signatureSection" class="inventory-signatures" aria-label="List signatures">
      <h2>List signatures</h2>
      <p v-if="displayBatch" class="ios-muted">{{ stageLabel(displayBatch.stage) }} · Version {{ displayBatch.version }} · {{ statusLabel(displayBatch.status) }}</p>
      <p class="ios-muted">Each signature covers the entire list. Changes require both parties to sign again.</p>
      <div v-for="role in ['pm', 'tenant']" :key="role" class="ios-row">
        <span class="ios-row-body"
          ><span>{{ role === 'pm' ? 'PM' : 'Primary tenant' }}</span
          ><span class="ios-row-meta">{{
            displayBatch?.signatures[role]?.name || 'Awaiting signature'
          }}</span></span
        ><span class="ios-muted">{{ date(displayBatch?.signatures[role]?.signed_at) }}</span>
      </div>
      <q-expansion-item v-if="Object.keys(displayBatch?.signatures || {}).length" label="View signatures">
        <section v-for="(signature, role) in displayBatch.signatures" :key="role">
          <h2>{{ role === 'pm' ? 'PM' : 'Primary tenant' }}: {{ signature.name }}</h2>
          <InventorySignature :model-value="signature.strokes || []" readonly />
          <p class="ios-muted">{{ date(signature.signed_at) }}</p>
          <p v-if="signature.capture_method === 'in_person'" class="ios-muted">
            Signed in person. Collected by PM ({{ signature.captured_by }}).
          </p>
        </section>
      </q-expansion-item>
      <div v-if="!historyVersion && workflowReady" class="inventory-sign-actions">
        <q-btn
          v-if="batch?.status !== 'confirmed' && !batch?.signatures[myRole]"
          class="ios-primary"
          unelevated
          no-caps
          label="Sign entire list"
          :disable="
            busy || !activeItems.length || moveOutUnchecked || !(state.context.tenant_user_id || state.context.tenant_profile_id)
          "
          @click="openSignature(myRole)"
        />
        <q-btn
          v-else-if="batch?.status === 'awaiting_confirmation' && state.context.tenant_user_id"
          class="ios-primary"
          unelevated
          no-caps
          icon="share"
          label="Share confirmation link"
          @click="share"
        />
        <q-btn
          v-if="myRole === 'pm' && batch?.status !== 'confirmed' && !batch?.signatures.tenant"
          class="ios-primary"
          outline
          no-caps
          label="Tenant signs on this device"
          :disable="busy || !activeItems.length || moveOutUnchecked || !(state.context.tenant_user_id || state.context.tenant_profile_id)"
          @click="openSignature('tenant')"
        />
      </div>
      <p v-if="moveOutUnchecked" class="ios-muted">{{ moveOutUnchecked }} items still need a recorded condition and explicit check before signing.</p>
      <p v-if="!(state.context.tenant_user_id || state.context.tenant_profile_id)" class="ios-error">
        Add a tenant to this lease to sign the list. No account registration or invitation is required for signing on this device.
      </p>
    </section>
    <template v-if="state && screen === 'item'">
      <q-form v-if="editing" class="ios-form" @submit="saveItem">
        <q-select v-model="draft.area" :options="roomOptions" use-input hide-selected fill-input input-debounce="0" outlined label="Room / area" @filter="filterRooms" @new-value="addRoom" :rules="[value => !!value?.trim() || 'Choose a room or Other']" hint="Choose a room, or type a new room name and press Enter to add it." />
        <q-input
          v-model="draft.name"
          outlined
          label="Item name"
          maxlength="160"
          :rules="[(v) => !!v.trim() || 'Enter an item name']"
        />
        <q-select v-model="draft.kind" :options="[{ label: 'Inventory item', value: 'item' }, { label: 'Key / access device', value: 'access' }]" emit-value map-options outlined label="Item type" :disable="selectedItem?.kind === 'access' || pendingEntry(selectedId)?.kind === 'access'" />
        <q-input v-if="draft.kind === 'access'" v-model.number="draft.quantity" outlined type="number" min="0" max="999" step="1" :label="isMoveOut ? 'Quantity returned' : 'Quantity provided / currently held'" :rules="[value => (value !== '' && value !== null && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 999) || 'Enter a whole number from 0 to 999']" />
        <q-select
          v-model="draft.condition"
          :options="conditions"
          emit-value
          map-options
          outlined
          label="Condition"
        />
        <q-input
          v-model="draft.note"
          outlined
          type="textarea"
          autogrow
          label="Notes (optional)"
          maxlength="2000"
        />
        <q-select v-if="isMoveOut && (!selectedId || pendingEntry(selectedId)?.added_at_move_out)" v-model="draft.replaces_item_id" :options="replacementOptions" emit-value map-options clearable outlined label="Replaces an existing item (optional)" />
        <PhotoAttachments
          :photos="draft.photos"
          :uploads="uploads"
          @capture="capture('item')"
          @choose="choosePhotos('item')"
          @remove="draft.photos.splice($event, 1)"
          @retry="retryUpload"
          @discard="discardUpload"
          @open="lightbox = $event"
        />
        <p v-if="selectedItem?.baseline" class="ios-muted">
          The original confirmed record remains unchanged.
        </p>
        <div class="ios-actions">
          <q-btn
            class="ios-primary"
            unelevated
            no-caps
            type="submit"
            label="Save item"
            :loading="busy"
            :disable="uploads.some((row) => row.status !== 'done')"
          /><q-btn
            flat
            no-caps
            label="Cancel"
            :disable="uploads.some((row) => row.status === 'uploading')"
            @click="cancelEdit"
          />
        </div>
      </q-form>
      <template v-else-if="selectedItem">
        <p v-if="selectedItem.closed" class="ios-tag">
          Closed by both parties · {{ date(selectedItem.closed_at) }}
        </p>
        <section v-if="pendingEntry(selectedItem.id)">
          <h2>Pending change</h2>
          <p>
            {{
              pendingEntry(selectedItem.id).action === 'close'
                ? pendingEntry(selectedItem.id).closure.reason
                : conditionLabel(pendingEntry(selectedItem.id).condition)
            }}
          </p>
          <p>{{ pendingEntry(selectedItem.id).note }}</p>
          <p v-if="pendingEntry(selectedItem.id).kind === 'access'">Quantity: {{ pendingEntry(selectedItem.id).quantity ?? 'Not recorded' }}</p>
          <div class="ios-photos">
            <button
              v-for="photo in pendingEntry(selectedItem.id).photos"
              :key="photo.path"
              class="ios-photo"
              style="border: 0; padding: 0"
              @click="lightbox = photo.url"
            >
              <img :src="photo.url" :alt="selectedItem.name" />
            </button>
          </div>
          <q-btn
            v-if="pendingEntry(selectedItem.id).action === 'close'"
            flat
            no-caps
            :label="
              pendingEntry(selectedItem.id).closure.requested_by === uid
                ? 'Withdraw closure request'
                : 'Decline closure request'
            "
            @click="resolveClosure"
          />
        </section>
        <section v-for="record in itemRecords" :key="record.label">
          <h2>{{ record.label }}</h2>
          <p>{{ conditionLabel(record.value.condition) }}</p>
          <p v-if="record.value.kind === 'access'">{{ record.value.stage === 'move_out' ? 'Returned' : 'Provided / held' }}: {{ record.value.quantity ?? 'Not recorded' }}</p>
          <p>{{ record.value.note }}</p>
          <span class="ios-muted">{{ date(record.value.confirmed_at) }}</span>
          <div class="ios-photos">
            <button
              v-for="photo in record.value.photos"
              :key="photo.path || photo.url"
              class="ios-photo"
              style="border: 0; padding: 0"
              @click="lightbox = photo.url"
            >
              <img :src="photo.url" :alt="selectedItem.name" />
            </button>
          </div>
        </section>
        <section v-if="selectedItem.legacy">
          <h2>Previous record</h2>
          <p class="ios-muted">Imported record. No bilateral signature is assumed.</p>
          <template v-for="stage in ['move_in', 'move_out']" :key="stage">
            <div
              v-if="
                selectedItem.legacy[`${stage}_comment`] || selectedItem.legacy[`${stage}_photo_url`]
              "
            >
              <h2>{{ stageLabel(stage) }}</h2>
              <p>{{ selectedItem.legacy[`${stage}_comment`] }}</p>
              <button
                v-if="selectedItem.legacy[`${stage}_photo_url`]"
                class="ios-photo"
                style="border: 0; padding: 0"
                @click="lightbox = selectedItem.legacy[`${stage}_photo_url`]"
              >
                <img
                  :src="selectedItem.legacy[`${stage}_photo_url`]"
                  :alt="`${selectedItem.name} ${stageLabel(stage)}`"
                />
              </button>
            </div>
          </template>
        </section>
        <q-btn flat no-caps icon="history" label="Confirmation history" @click="openItemHistory" />
        <q-btn
          v-if="canEdit && pendingEntry(selectedItem.id)?.action !== 'close'"
          flat
          no-caps
          icon="more_horiz"
          label="More"
          ><q-menu
            ><q-list
              ><q-item clickable v-close-popup @click="openClosureDialog"
                ><q-item-section>Request closure</q-item-section></q-item
              ></q-list
            ></q-menu
          ></q-btn
        >
        <h2 v-if="workflowReady">Notes</h2>
        <div v-for="note in notes" :key="note.id" class="ios-note">
          <span class="ios-muted">{{ note.author_name }} · {{ date(note.created_at) }}</span>
          <p>{{ note.note }}</p>
          <div class="ios-photos">
            <button
              v-for="photo in note.photos"
              :key="photo.path"
              class="ios-photo"
              style="border: 0; padding: 0"
              @click="lightbox = photo.url"
            >
              <img :src="photo.url" alt="Note attachment" />
            </button>
          </div>
        </div>
        <q-input
          v-if="workflowReady"
          v-model="noteText"
          outlined
          type="textarea"
          autogrow
          label="Add a note"
          maxlength="4000"
        />
        <PhotoAttachments
          v-if="workflowReady"
          :photos="notePhotos"
          :uploads="noteUploads"
          @capture="capture('note')"
          @choose="choosePhotos('note')"
          @remove="notePhotos.splice($event, 1)"
          @retry="retryUpload"
          @discard="discardUpload"
          @open="lightbox = $event"
        />
        <q-btn
          v-if="workflowReady"
          class="ios-primary"
          unelevated
          no-caps
          label="Post note"
          :loading="busy"
          :disable="
            (!noteText.trim() && !notePhotos.length) ||
            noteUploads.some((row) => row.status !== 'done')
          "
          @click="postNote"
        />
      </template>
    </template>
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      hidden
      @change="filesChosen"
    />
    <input ref="photoInput" type="file" accept="image/*" multiple hidden @change="filesChosen" />
    <q-dialog v-model="contextOpen"
      ><q-card class="ios-dialog"
        ><h2>Lease details</h2>
        <p>{{ propertyLabel }}</p>
        <p>{{ state?.context.lease_label }}</p>
        <p>PM: {{ state?.context.pm_name }}</p>
        <p>Lease tenant: {{ state?.context.tenant_name || 'No lease tenant' }}</p>
        <q-btn flat no-caps label="Close" v-close-popup /></q-card
    ></q-dialog>
    <q-dialog v-model="signatureOpen" persistent
      ><q-card class="ios-dialog ios-workspace inventory-sign-dialog"
        ><h2>{{ signingRole === 'tenant' ? 'Tenant signature' : 'PM signature' }}</h2>
        <p v-if="signingRole === 'tenant'">{{ state.context.tenant_name || 'Lease tenant' }}</p>
        <p v-if="signingRole === 'tenant' && myRole === 'pm'">
          Hand this device to the tenant to review and sign. This signature is recorded as collected by the signed-in PM, not as a tenant account login.
        </p>
        <p>
          Your signature covers all {{ batch?.entries.length }} items in version
          {{ signingVersion }}, including any listed closure requests.
        </p>
        <InventorySignature v-model="signature" /><q-checkbox
          v-model="consent"
          label="I am the named signer and have reviewed and agree to this entire list." />
        <p v-if="signatureError" class="ios-error" role="alert">{{ signatureError }}</p>
        <q-btn v-if="signatureError" flat no-caps label="Reload latest list" :disable="busy" @click="signatureOpen = false; reloadPreservingDraft()" />
        <q-card-actions align="right"
          ><q-btn
            flat
            no-caps
            label="Cancel"
            :disable="busy"
            @click="signatureOpen = false" /><q-btn
            unelevated
            no-caps
            class="ios-primary"
            label="Confirm & sign"
            :loading="busy"
            :disable="!consent || signature.flat().length < 3"
            @click="sign" /></q-card-actions></q-card
    ></q-dialog>
    <q-dialog v-model="closureOpen" persistent
      ><q-card class="ios-dialog"
        ><h2>Request closure</h2>
        <p>The item stays active until both parties confirm this batch.</p>
        <q-input
          v-model="closeReason"
          outlined
          type="textarea"
          label="Reason"
          maxlength="2000" /><q-card-actions align="right"
          ><q-btn flat no-caps label="Cancel" :disable="busy" v-close-popup /><q-btn
            no-caps
            unelevated
            color="primary"
            label="Request closure"
            :disable="!closeReason.trim()"
            :loading="busy"
            @click="requestClosure" /></q-card-actions></q-card
    ></q-dialog>
    <q-dialog v-model="unchangedOpen"
      ><q-card class="ios-dialog"
        ><h2>Mark unchanged</h2>
        <q-option-group
          v-model="unchangedIds"
          type="checkbox"
          :options="
            unchangedCandidates.map((item) => ({ label: item.name, value: item.id }))
          " /><q-card-actions
          ><q-btn flat no-caps label="Cancel" v-close-popup /><q-btn
            no-caps
            unelevated
            color="primary"
            label="Mark selected unchanged"
            :disable="!unchangedIds.length"
            :loading="busy"
            @click="markUnchanged" /></q-card-actions></q-card
    ></q-dialog>
    <q-dialog v-model="chooseItemOpen"
      ><q-card class="ios-dialog"
        ><h2>Choose item</h2>
        <q-list
          ><q-item
            v-for="item in activeItems"
            :key="item.id"
            clickable
            @click="chooseExistingItem(item)"
            ><q-item-section>{{ item.name }}</q-item-section></q-item
          ></q-list
        ></q-card
      ></q-dialog
    >
    <q-dialog :model-value="!!lightbox" @update:model-value="lightbox = ''"
      ><q-card class="ios-dialog"
        ><img
          :src="lightbox"
          alt="Inventory photo"
          style="width: 100%; max-height: 75vh; object-fit: contain" /><q-btn
          flat
          no-caps
          label="Close"
          @click="lightbox = ''" /></q-card
    ></q-dialog>
  </div>
</template>
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { auth } from 'src/boot/firebase'
import { useUserDataStore } from 'src/stores/userDataStore'
import {
  getInventory,
  inventoryCommand,
  inventoryPath,
  mobileRequest,
  uploadInventoryPhoto,
} from 'src/services/mobileApi'
import WorkspaceHeader from 'src/components/mobile/WorkspaceHeader.vue'
import InventorySignature from 'src/components/mobile/InventorySignature.vue'
import PhotoAttachments from 'src/components/mobile/PhotoAttachments.vue'
import MoveOutChecklist from './MoveOutChecklist.vue'
import 'src/css/mobile-workspace.scss'
import { legacyInventoryView } from 'src/utils/inventoryView'
import { inventoryRooms } from 'src/utils/inventoryRooms'
const props = defineProps({ leaseId: { type: String, default: '' }, embedded: Boolean })
const emit = defineEmits(['close'])
const route = useRoute(),
  router = useRouter(),
  store = useUserDataStore()
const leaseId = computed(() => {
  const requested = props.leaseId || String(route.params.leaseId || '')
  return (store.userAccessibleLeases || []).find(lease => lease.id === requested)?.inventory_source_lease_id || requested
}),
  tenantReview = computed(() => !!route.meta.tenantReview)
const workflowReady = ref(false)
const state = ref(null),
  loading = ref(false),
  busy = ref(false),
  error = ref(''),
  screen = ref('list'),
  tab = ref('items'),
  search = ref('')
const uid = computed(() => auth.currentUser?.uid || ''),
  batch = computed(() => state.value?.batch),
  myRole = computed(() => (uid.value === state.value?.context.pm_user_id ? 'pm' : 'tenant'))
const history = ref([]),
  historyVersion = ref(null),
  displayBatch = computed(() => historyVersion.value || batch.value)
const itemOrigin = ref('list')
const isMoveOut = computed(() => batch.value?.stage === 'move_out')
const moveOutUnchecked = computed(() => isMoveOut.value ? batch.value.entries.filter(entry => !entry.checked || entry.condition === 'not_checked' || (entry.kind === 'access' && !Number.isInteger(entry.quantity))).length : 0)
const currentProperty = computed(() => store.userAccessibleProperties?.find(p => p.id === state.value?.context.property_id))
const allRooms = computed(() => inventoryRooms(currentProperty.value, [...(state.value?.rooms || []), ...(state.value?.items || []).map(item => pendingEntry(item.id)?.area || item.area)]))
const roomOptions = ref([])
function filterRooms(value, update) { update(() => { roomOptions.value = allRooms.value.filter(room => room.toLowerCase().includes(value.toLowerCase())) }) }
function addRoom(value, done) {
  const room = value.trim().replace(/\s+/g, ' ')
  if (!room || room.length > 100) return
  done(allRooms.value.find(name => name.toLowerCase() === room.toLowerCase()) || room, 'add-unique')
}
const replacementOptions = computed(() => (state.value?.items || []).filter(item => item.id !== selectedId.value && item.latest && item.latest.stage !== 'move_out').map(item => ({ label: item.name, value: item.id })))
const propertyLabel = computed(() => {
  const property = store.userAccessibleProperties?.find(
    (p) => p.id === state.value?.context.property_id,
  )
  return (
    property?.nickname || property?.address || state.value?.context.property_label || 'Property'
  )
})
const activeItems = computed(() => state.value?.items.filter((item) => !item.closed) || []),
  closedItems = computed(() => state.value?.items.filter((item) => item.closed) || [])
const selectedId = ref(''),
  selectedItem = computed(() => state.value?.items.find((item) => item.id === selectedId.value))
const editing = ref(false),
  canEdit = computed(
    () =>
      workflowReady.value &&
      !!batch.value &&
      batch.value.status !== 'confirmed' &&
      !selectedItem.value?.closed,
  )
const groups = computed(() => {
  const grouped = new Map()
  for (const item of activeItems.value) {
    const entry = pendingEntry(item.id) || item
    if (!`${entry.name} ${entry.area}`.toLowerCase().includes((search.value || '').toLowerCase())) continue
    const area = entry.area || 'Other'
    if (!grouped.has(area)) grouped.set(area, [])
    grouped.get(area).push(item)
  }
  return [...grouped].map(([area, items]) => ({ area, items }))
})
const stageLabel = (stage) =>
  ({ move_in: 'Move-in check', inspection: 'Inspection', move_out: 'Move-out check' })[stage] ||
  'Check'
const statusLabel = (status) =>
  ({ draft: 'Draft', awaiting_confirmation: 'Awaiting confirmation', confirmed: 'Both confirmed', withdrawn: 'Withdrawn' })[
    status
  ] || status
const conditions = [
  { label: 'Good', value: 'good' },
  { label: 'Wear & tear', value: 'worn' },
  { label: 'Damaged', value: 'damaged' },
  { label: 'Missing', value: 'missing' },
  { label: 'Not specified', value: 'not_checked' },
]
const conditionLabel = (condition) =>
  conditions.find((row) => row.value === condition)?.label || 'Not recorded'
const date = (value) =>
  value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''
const pendingEntry = (id) =>
  batch.value?.status !== 'confirmed'
    ? batch.value?.entries.find((entry) => entry.item_id === id)
    : null
const itemPhoto = (item) =>
  pendingEntry(item.id)?.photos?.[0]?.url ||
  item.latest?.photos?.[0]?.url ||
  item.legacy?.move_in_photo_url
const itemRecords = computed(() => {
  const item = selectedItem.value
  if (!item) return []
  const rows = []
  if (item.baseline)
    rows.push({
      label: item.baseline.stage === 'move_in' ? 'Move-in record' : 'First confirmed record',
      value: item.baseline,
    })
  if (item.latest && item.latest.batch_id !== item.baseline?.batch_id)
    rows.push({ label: stageLabel(item.latest.stage), value: item.latest })
  return rows
})
const displayedEntries = computed(() => displayBatch.value?.entries || [])
const unchangedCandidates = computed(() =>
  activeItems.value.filter((item) => item.latest && !pendingEntry(item.id)?.checked),
)
let loadSequence = 0
async function load() {
  if (busy.value) return
  const sequence = ++loadSequence
  const requestedLease = leaseId.value
  loading.value = true
  error.value = ''
  workflowReady.value = false
  try {
    const payload = await getInventory(requestedLease)
    if (!alive || sequence !== loadSequence) return
    if (!Object.hasOwn(payload, 'inventory'))
      throw Object.assign(new Error('Inventory workflow is not deployed yet.'), { status: 501 })
    state.value = payload.inventory
    if (screen.value === 'list' && state.value?.batch?.stage === 'move_out' && tab.value === 'items') screen.value = 'move_out'
    workflowReady.value = true
  } catch (err) {
    if (!alive || sequence !== loadSequence) return
    error.value = err.message
    if ([404, 501].includes(err.status)) {
      try {
        const legacy = await mobileRequest(
          `/leases/${encodeURIComponent(requestedLease)}/inventories/primary`,
        )
        if (!alive || sequence !== loadSequence) return
        state.value = legacyInventoryView(legacy.inventory, requestedLease)
        error.value =
          'Read-only. The bilateral confirmation service is not available yet; existing records remain unchanged.'
      } catch (legacyError) {
        if (!alive || sequence !== loadSequence) return
        state.value = null
        error.value = legacyError.message
      }
    }
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}
async function command(body) {
  if (busy.value) return false
  if (!workflowReady.value) {
    error.value = 'The confirmation service is not available yet.'
    return false
  }
  busy.value = true
  const requestedLease = leaseId.value
  ++loadSequence
  loading.value = false
  error.value = ''
  try {
    const payload = await inventoryCommand(requestedLease, {
      expected_revision: state.value?.revision ?? 0,
      ...body,
    })
    if (!payload.inventory) throw new Error('The server did not return a saved inventory.')
    if (!alive || requestedLease !== leaseId.value) return false
    state.value = payload.inventory
    return true
  } catch (err) {
    const oldPhaseErrors = ['Open the move-out checklist first.', 'Continue the move-out checklist before starting another list.', 'Continue the existing check first.']
    error.value = oldPhaseErrors.includes(err.message) && (isMoveOut.value || body.stage === 'move_out')
      ? 'The connected API still uses the previous move-out workflow. The inventory API update must be deployed before this action can work; starting another list will not help.'
      : err.message
    return false
  } finally {
    busy.value = false
  }
}
async function reloadPreservingDraft() {
  await load()
  if (editing.value)
    Notify.create({
      message: 'List reloaded. Your unsaved input is preserved; review it before saving.',
    })
}
function goList() {
  screen.value = 'list'
  historyVersion.value = null
  editing.value = false
}
function goBatch() {
  historyVersion.value = null
  screen.value = itemOrigin.value
  tab.value = 'items'
  editing.value = false
}
function back() {
  if (hasActiveUpload() || busy.value) {
    error.value = 'Wait for the current save or upload to finish before leaving.'
    return
  }
  if (
    (editing.value || noteText.value.trim() || notePhotos.value.length) &&
    !window.confirm('Discard unsaved changes?')
  )
    return
  if (screen.value !== 'list') {
    const destination = screen.value === 'item' ? itemOrigin.value : 'list'
    editing.value = false
    uploads.value = []
    screen.value = destination
    historyVersion.value = null
    noteText.value = ''
    notePhotos.value = []
  } else if (props.embedded) emit('close')
  else router.push(tenantReview.value ? '/mobile/login' : '/mobile/pm/property')
}
const contextOpen = ref(false),
  chooseItemOpen = ref(false)
const signatureSection = ref(null)
function showSignatures() {
  tab.value = 'items'
  if (isMoveOut.value) screen.value = 'move_out'
  nextTick(() => signatureSection.value?.scrollIntoView({ block: 'center' }))
}
function closeWorkspace() {
  if (busy.value || hasActiveUpload()) return
  if ((editing.value || noteText.value.trim() || notePhotos.value.length) && !window.confirm('Discard unsaved changes?')) return
  editing.value = false
  noteText.value = ''
  notePhotos.value = []
  if (props.embedded) emit('close')
  else router.push(tenantReview.value ? '/mobile/login' : '/mobile/pm/property')
}
async function ensureListDraft() {
  if (!state.value && !(await command({ type: 'initialize' }))) return false
  if (isMoveOut.value) {
    if (batch.value.status !== 'confirmed') return true
    error.value = 'Move-out is already confirmed. Open View move-out to see the signed record.'
    return false
  }
  if (!batch.value || batch.value.status === 'confirmed')
    return command({ type: 'start', stage: 'inspection', scope: 'list' })
  if (batch.value.scope !== 'list') return command({ type: 'prepare_list' })
  return true
}
async function startMoveIn() {
  if (!state.value && !(await command({ type: 'initialize' }))) return
  if (await command({ type: 'start', stage: 'move_in', scope: 'list' })) tab.value = 'items'
}
async function openMoveOut() {
  if (busy.value || loading.value) return
  await load()
  if (!workflowReady.value || error.value) return
  if (!isMoveOut.value) {
    let withdrawPending = false
    if (batch.value && batch.value.status !== 'confirmed') {
      if (myRole.value !== 'pm') {
        error.value = 'Ask the property manager to withdraw the pending list, or finish both signatures before starting move-out.'
        return
      }
      if (!window.confirm('Withdraw this unfinished list and start move-out? Its entries and any signatures will remain in History, but will not count as confirmed move-in evidence. Confirmed records stay unchanged. Move-out conditions, photos, quantities and signatures must be recorded again.')) return
      withdrawPending = true
    }
    if (!(await command({ type: 'start', stage: 'move_out', scope: 'move_out', withdraw_pending: withdrawPending }))) return
  }
  historyVersion.value = null
  screen.value = 'move_out'
}
function editMoveOutItem(id) {
  const item = state.value.items.find(item => item.id === id)
  if (batch.value.status === 'confirmed') {
    selectedId.value = id
    editing.value = false
    itemOrigin.value = 'move_out'
    screen.value = 'item'
  } else editItem(item)
}
async function saveMoveOutCondition(entry, condition) {
  await command({ type: 'save_item', item_id: entry.item_id, entry: { ...entry, condition } })
}
async function reviewMoveOutItem(id, checked) { await command({ type: 'review_item', item_id: id, checked }) }
async function useReference(id) { await command({ type: 'use_reference', item_id: id }) }
async function openHistory() {
  tab.value = 'history'
  if (!workflowReady.value) {
    history.value = []
    return
  }
  loading.value = true
  try {
    history.value = (await mobileRequest(`${inventoryPath(leaseId.value)}/history`)).items || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
function openVersion(version) {
  historyVersion.value = version
  screen.value = 'batch'
}
async function openItemHistory() {
  await openHistory()
  history.value = history.value.filter((version) =>
    version.entries.some((entry) => entry.item_id === selectedId.value),
  )
  screen.value = 'list'
}
const notes = ref([]),
  noteText = ref(''),
  notePhotos = ref([]),
  noteUploads = ref([])
async function openItem(item) {
  if (workflowReady.value && (batch.value?.scope === 'list' || isMoveOut.value) && batch.value.status !== 'confirmed' && !item.closed) {
    editItem(item)
    return
  }
  selectedId.value = item.id
  editing.value = false
  screen.value = 'item'
  noteText.value = ''
  notePhotos.value = []
  noteUploads.value = []
  await loadNotes()
}
function openItemById(id, historical) {
  if (historical) return
  const item = state.value.items.find((row) => row.id === id)
  if (item) openItem(item)
}
async function loadNotes() {
  notes.value = []
  if (!workflowReady.value) return
  const id = selectedId.value
  try {
    const rows =
      (await mobileRequest(`${inventoryPath(leaseId.value)}/items/${encodeURIComponent(id)}/notes`))
        .items || []
    if (id === selectedId.value) notes.value = rows
  } catch (err) {
    error.value = err.message
  }
}
const draft = reactive({ name: '', area: 'Other', kind: 'item', quantity: null, condition: 'not_checked', note: '', photos: [], replaces_item_id: null }),
  uploads = ref([]),
  newId = ref('')
function editItem(item) {
  if (!batch.value || batch.value.status === 'confirmed') {
    error.value = 'Start a new check before editing.'
    return
  }
  selectedId.value = item.id
  itemOrigin.value = isMoveOut.value ? 'move_out' : 'list'
  const entry = pendingEntry(item.id) || item.latest || item
  Object.assign(draft, {
    name: entry.name || item.name,
    area: entry.area || item.area || 'Other',
    kind: entry.kind || item.kind || 'item',
    quantity: entry.quantity ?? null,
    replaces_item_id: entry.replaces_item_id || null,
    condition: entry.condition || 'not_checked',
    note: pendingEntry(item.id)?.note || '',
    photos: JSON.parse(JSON.stringify(pendingEntry(item.id)?.photos || [])),
  })
  uploads.value = []
  editing.value = true
  screen.value = 'item'
}
async function newItem(area = 'Other') {
  if (busy.value || !(await ensureListDraft())) return
  itemOrigin.value = isMoveOut.value ? 'move_out' : 'list'
  selectedId.value = ''
  newId.value = crypto.randomUUID()
  Object.assign(draft, { name: '', area: typeof area === 'string' ? area : 'Other', kind: 'item', quantity: null, condition: 'not_checked', note: '', photos: [], replaces_item_id: null })
  uploads.value = []
  editing.value = true
  screen.value = 'item'
}
async function newAccessItem() {
  await newItem('Other')
  if (editing.value && !selectedId.value) draft.kind = 'access'
}
async function saveMoveOutQuantity(entry, quantity) {
  await command({ type: 'save_item', item_id: entry.item_id, entry: { ...entry, quantity } })
}
function cancelEdit() {
  if (!window.confirm('Discard unsaved item changes?')) return
  editing.value = false
  uploads.value = []
  goBatch()
}
async function saveItem() {
  if (uploads.value.some((row) => row.status !== 'done')) return
  if (
    await command({
      type: 'save_item',
      item_id: selectedId.value || undefined,
      new_item_id: newId.value || undefined,
      entry: JSON.parse(JSON.stringify(draft)),
    })
  ) {
    editing.value = false
    goList()
    screen.value = itemOrigin.value
    Notify.create({ message: 'Item saved. Both parties sign the entire list when ready.' })
  }
}
let photoTarget = 'item',
  alive = true
const cameraInput = ref(null),
  photoInput = ref(null),
  lightbox = ref('')
function capture(target) {
  photoTarget = target
  cameraInput.value.click()
}
function choosePhotos(target) {
  photoTarget = target
  photoInput.value.click()
}
async function filesChosen(event) {
  const files = [...event.target.files]
  event.target.value = ''
  const target = photoTarget,
    queue = target === 'item' ? uploads.value : noteUploads.value,
    photos = target === 'item' ? draft.photos : notePhotos.value
  if (photos.length + queue.filter((row) => row.status !== 'done').length + files.length > 12) {
    error.value = 'Use up to 12 photos per item or note.'
    return
  }
  for (const file of files) {
    const row = reactive({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      status: 'uploading',
      target,
      itemId: selectedId.value || newId.value,
      preview: URL.createObjectURL(file),
      error: '',
    })
    queue.push(row)
    await retryUpload(row)
  }
}
async function retryUpload(row) {
  row.status = 'uploading'
  row.error = ''
  try {
    const photo = await uploadInventoryPhoto({
      propertyId: state.value.context.property_id,
      leaseId: leaseId.value,
      itemId: row.itemId,
      file: row.file,
    })
    if (!alive || row.itemId !== (selectedId.value || newId.value)) {
      URL.revokeObjectURL(row.preview)
      return
    }
    ;(row.target === 'item' ? draft.photos : notePhotos.value).push(photo)
    row.status = 'done'
    URL.revokeObjectURL(row.preview)
  } catch (err) {
    row.status = 'failed'
    row.error = err.message
  }
}
function discardUpload(row) {
  if (row.status === 'uploading') return
  const queue = row.target === 'item' ? uploads.value : noteUploads.value
  const index = queue.indexOf(row)
  if (index >= 0) queue.splice(index, 1)
  URL.revokeObjectURL(row.preview)
}
async function postNote() {
  busy.value = true
  error.value = ''
  try {
    await mobileRequest(
      `${inventoryPath(leaseId.value)}/items/${encodeURIComponent(selectedId.value)}/notes`,
      { method: 'POST', body: { note: noteText.value, photos: notePhotos.value } },
    )
    noteText.value = ''
    notePhotos.value = []
    noteUploads.value = []
    await loadNotes()
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}
const closureOpen = ref(false),
  closeReason = ref(''),
  unchangedOpen = ref(false),
  unchangedIds = ref([])
async function requestClosure() {
  if (
    await command({ type: 'request_close', item_id: selectedId.value, reason: closeReason.value })
  )
    closureOpen.value = false
}
function openClosureDialog() {
  closeReason.value = ''
  closureOpen.value = true
}
function chooseExistingItem(item) {
  chooseItemOpen.value = false
  editItem(item)
}
async function resolveClosure() {
  const own = pendingEntry(selectedId.value).closure.requested_by === uid.value
  await command({ type: own ? 'withdraw_close' : 'reject_close', item_id: selectedId.value })
}
async function markUnchanged() {
  if (await command({ type: 'unchanged', item_ids: unchangedIds.value })) {
    unchangedOpen.value = false
    unchangedIds.value = []
  }
}
const signatureOpen = ref(false),
  signingVersion = ref(null),
  signingBatchId = ref(null),
  signingRevision = ref(null),
  signingRole = ref('pm'),
  signature = ref([]),
  consent = ref(false),
  signatureError = ref('')
async function openSignature(role) {
  if (busy.value || loading.value) return
  const reviewedRevision = state.value?.revision
  await load()
  if (!workflowReady.value || error.value) return
  if (batch.value?.status === 'confirmed' || batch.value?.signatures?.[role]) {
    Notify.create({ message: 'The latest saved signature status is now displayed.' })
    return
  }
  if (state.value?.revision !== reviewedRevision) {
    error.value = 'The list has been updated. Review the latest items and signature status before signing.'
    return
  }
  if (moveOutUnchecked.value) {
    error.value = 'Record the condition and returned quantities, then check every item before signing.'
    return
  }
  if (!(await ensureListDraft())) return
  signingRole.value = role
  signingVersion.value = batch.value.version
  signingBatchId.value = batch.value.id
  signingRevision.value = state.value.revision
  signatureOpen.value = true
}
watch(signatureOpen, () => {
  signature.value = []
  consent.value = false
  signatureError.value = ''
})
async function sign() {
  if (batch.value?.id !== signingBatchId.value || batch.value?.version !== signingVersion.value || state.value?.revision !== signingRevision.value) {
    signatureError.value = 'The list changed. Close this dialog, review the latest list, and sign again.'
    return
  }
  if (
    await command({ type: 'sign', expected_revision: signingRevision.value, batch_version: signingVersion.value, signature: signature.value,
      signer_role: signingRole.value,
      capture_method: signingRole.value === 'tenant' && myRole.value === 'pm' ? 'in_person' : 'authenticated' })
  ) {
    signatureOpen.value = false
    Notify.create({
      message:
        batch.value.status === 'confirmed'
          ? 'Both parties confirmed.'
          : 'Signature saved. Waiting for the other party.',
    })
  } else signatureError.value = error.value
}
async function share() {
  const url = `https://tobbythebutler.web.app/inventory-review/${encodeURIComponent(leaseId.value)}`
  try {
    if (navigator.share) await navigator.share({ title: 'Inventory confirmation', url })
    else {
      await navigator.clipboard.writeText(url)
      Notify.create({ message: 'Confirmation link copied.' })
    }
  } catch (err) {
    if (err.name !== 'AbortError') error.value = 'Unable to share the link.'
  }
}
function hasActiveUpload() {
  return [...uploads.value, ...noteUploads.value].some((row) => row.status === 'uploading')
}
function canLeave() {
  if (hasActiveUpload() || busy.value) {
    error.value = 'Wait for the current save or upload to finish before leaving.'
    return false
  }
  return (
    (!editing.value && !noteText.value.trim() && !notePhotos.value.length) ||
    window.confirm('Discard unsaved changes?')
  )
}
onBeforeRouteLeave(canLeave)
onBeforeRouteUpdate((to, from) => to.params.leaseId === from.params.leaseId || canLeave())
function refreshOnFocus() {
  if (document.visibilityState !== 'visible' || busy.value || loading.value || editing.value || signatureOpen.value || historyVersion.value || hasActiveUpload() || noteText.value.trim() || notePhotos.value.length) return
  load()
}
onMounted(() => window.addEventListener('focus', refreshOnFocus))
onBeforeUnmount(() => {
  alive = false
  window.removeEventListener('focus', refreshOnFocus)
  for (const row of [...uploads.value, ...noteUploads.value]) URL.revokeObjectURL(row.preview)
})
watch(
  leaseId,
  () => {
    state.value = null
    history.value = []
    selectedId.value = ''
    newId.value = ''
    notes.value = []
    noteText.value = ''
    notePhotos.value = []
    for (const row of [...uploads.value, ...noteUploads.value]) URL.revokeObjectURL(row.preview)
    uploads.value = []
    noteUploads.value = []
    goList()
    load()
  },
  { immediate: true },
)
</script>
<style scoped>
.inventory-list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--ios-line, #e0e6df);
}
.inventory-list-actions > div { flex: 1 1 220px; min-width: 0; }
.inventory-list-actions p { margin: 2px 0 0; font-size: 14px; color: var(--ios-muted, #65756c); }
.inventory-list-actions .q-btn { min-width: 104px; min-height: 44px; }
.inventory-filters { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 16px; }
.inventory-filters .ios-segments { margin: 0; flex: 0 0 auto; }
.inventory-filters .q-field { flex: 1 1 160px; min-width: 0; }
@media (max-width: 600px) { .inventory-list-actions .q-btn { flex: 1; } }
.inventory-workspace { min-width: 0; }
.inventory-workspace :deep(.ios-header) { margin-bottom: 0; min-height: 44px; }
.inventory-workspace :deep(.ios-header h1) { margin: 0; font-size: 24px; line-height: 1.25; }
.inventory-workspace > .ios-context { margin-bottom: 0; font-size: 14px; }
.inventory-group { margin: 8px 0; border: 1px solid var(--brand-border, #dbe3dc); border-radius: 8px; overflow: hidden; background: var(--brand-surface, white); }
.inventory-group h2 { margin: 0; padding: 6px 12px; background: var(--brand-canvas, #f7f8f4); font-size: 14px; line-height: 1.4; }
.inventory-room-heading { display: flex; align-items: center; justify-content: space-between; background: var(--brand-canvas, #f7f8f4); }
.inventory-room-heading .q-btn { min-height: 44px; }
.inventory-group .ios-row { min-height: 48px; padding: 8px 12px; margin: 0; border: 0; border-top: 1px solid var(--brand-border, #dbe3dc); border-radius: 0; text-align: left; }
.inventory-group .ios-row-body { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 2px 12px; }
.inventory-group .ios-row-title { font-size: 16px; line-height: 1.4; overflow-wrap: anywhere; }
.inventory-group .ios-row-body > :not(.ios-row-title):not(.inventory-item-condition) { grid-column: 1 / -1; }
.inventory-group .inventory-item-condition { margin: 0; font-size: 13px; line-height: 1.4; text-align: right; max-width: 96px; }
@media (max-width: 600px) {
  .inventory-workspace :deep(.ios-header h1) { font-size: 22px; }
  .inventory-list-actions > div { flex-basis: 100%; }
}
.inventory-item-note { display: block; color: var(--brand-ink, #243830); font-size: 14px; overflow-wrap: anywhere; white-space: pre-wrap; margin-top: 4px; }
.inventory-item-photos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.inventory-item-photos img { object-fit: cover; border-radius: 4px; }
.inventory-signatures { margin-top: 20px; padding: 16px; border: 1px solid var(--brand-border, #dbe3dc); border-radius: 10px; background: var(--brand-surface, white); scroll-margin-top: 100px; }
.inventory-signatures h2 { margin: 0 0 6px; font-size: 18px; }
.inventory-signatures .ios-row { padding: 8px 0; margin: 0; }
.inventory-sign-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.inventory-sign-actions .q-btn { min-height: 44px; }
:global(.q-dialog .q-dialog__inner > .inventory-sign-dialog) { width: min(680px, calc(100vw - 32px)) !important; max-width: calc(100vw - 32px) !important; max-height: calc(100dvh - 32px); overflow-y: auto; }
</style>
