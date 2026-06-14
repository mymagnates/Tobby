import Foundation

struct TenantRecordItem: Identifiable {
    let id: String
    let title: String
    let subtitle: String
}

struct TenantRecordsSnapshot {
    var taskItems: [TenantRecordItem]
    var transactionItems: [TenantRecordItem]
    var leaseItems: [TenantRecordItem]
    var inventoryItems: [TenantRecordItem]

    static let empty = TenantRecordsSnapshot(
        taskItems: [],
        transactionItems: [],
        leaseItems: [],
        inventoryItems: []
    )
}
