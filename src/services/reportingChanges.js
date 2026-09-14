import { readonly, ref } from 'vue'

const revision = ref(0)
export const transactionReportRevision = readonly(revision)
export function notifyReportTransactionSaved() {
  revision.value += 1
}
