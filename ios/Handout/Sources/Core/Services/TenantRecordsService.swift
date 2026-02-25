import Foundation

#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

protocol TenantRecordsServiceProtocol {
    func fetchRecords(userID: String) async throws -> TenantRecordsSnapshot
}

final class TenantRecordsService: TenantRecordsServiceProtocol {
    private let taskUserFields = FirestoreSchema.TaskFields.createdByCandidates
    private let transactionUserFields = FirestoreSchema.TransactionFields.userCandidates
    private let leaseUserFields = FirestoreSchema.LeaseFields.userCandidates
    private let inventoryUserFields = FirestoreSchema.InventoryFields.userCandidates

    func fetchRecords(userID: String) async throws -> TenantRecordsSnapshot {
        #if canImport(FirebaseFirestore)
        async let tasks = fetchTaskItems(userID: userID)
        async let transactions = fetchTransactionItems(userID: userID)
        async let leases = fetchLeaseItems(userID: userID)
        async let inventory = fetchInventoryItems(userID: userID)

        return TenantRecordsSnapshot(
            taskItems: try await tasks,
            transactionItems: try await transactions,
            leaseItems: try await leases,
            inventoryItems: try await inventory
        )
        #else
        _ = userID
        return .empty
        #endif
    }

    #if canImport(FirebaseFirestore)
    private func fetchTaskItems(userID: String) async throws -> [TenantRecordItem] {
        let documents = try await FirestoreQueryHelper.collectionGroupDocs(
            collectionID: FirestoreSchema.Collections.mxrecords,
            userID: userID,
            userFieldCandidates: taskUserFields,
            limit: 50
        )
        return documents.map { document in
            let data = document.data()
            let title = FirestoreValueDecoder.string(data[FirestoreSchema.TaskFields.titleCandidates[1]]) ??
                FirestoreValueDecoder.string(data[FirestoreSchema.TaskFields.titleCandidates[0]]) ?? "Task"
            let status = FirestoreValueDecoder.string(data[FirestoreSchema.CommonFields.status]) ?? "unknown"
            let priority = FirestoreValueDecoder.string(data[FirestoreSchema.TaskFields.priorityCandidates[1]]) ??
                FirestoreValueDecoder.string(data[FirestoreSchema.TaskFields.priorityCandidates[0]]) ?? "n/a"
            return TenantRecordItem(id: document.documentID, title: title, subtitle: "status: \(status) · priority: \(priority)")
        }
    }

    private func fetchTransactionItems(userID: String) async throws -> [TenantRecordItem] {
        let documents = try await FirestoreQueryHelper.collectionGroupDocs(
            collectionID: FirestoreSchema.Collections.transactions,
            userID: userID,
            userFieldCandidates: transactionUserFields,
            limit: 50
        )
        return documents.map { document in
            let data = document.data()
            let type = FirestoreValueDecoder.string(data[FirestoreSchema.TransactionFields.typeCandidates[0]]) ??
                FirestoreValueDecoder.string(data[FirestoreSchema.TransactionFields.typeCandidates[1]]) ?? "transaction"
            let amount = FirestoreValueDecoder.double(data[FirestoreSchema.TransactionFields.amount]) ?? 0
            let method = FirestoreValueDecoder.string(data[FirestoreSchema.TransactionFields.method]) ?? "unknown"
            let date = FirestoreValueDecoder.date(data[FirestoreSchema.TransactionFields.dateCandidates[0]]) ??
                FirestoreValueDecoder.date(data[FirestoreSchema.TransactionFields.dateCandidates[1]])
            return TenantRecordItem(
                id: document.documentID,
                title: "\(type) · \(currency(amount))",
                subtitle: "\(shortDate(date)) · method: \(method)"
            )
        }
    }

    private func fetchLeaseItems(userID: String) async throws -> [TenantRecordItem] {
        let documents = try await FirestoreQueryHelper.collectionDocs(
            collectionID: FirestoreSchema.Collections.leases,
            userID: userID,
            userFieldCandidates: leaseUserFields,
            limit: 20
        )
        return documents.map { document in
            let data = document.data()
            let startDate = FirestoreValueDecoder.date(data[FirestoreSchema.LeaseFields.startDate])
            let endDate = FirestoreValueDecoder.date(data[FirestoreSchema.LeaseFields.endDate])
            return TenantRecordItem(
                id: document.documentID,
                title: "Lease #\(document.documentID)",
                subtitle: "\(shortDate(startDate)) to \(shortDate(endDate))"
            )
        }
    }

    private func fetchInventoryItems(userID: String) async throws -> [TenantRecordItem] {
        let documents = try await FirestoreQueryHelper.collectionDocs(
            collectionID: FirestoreSchema.Collections.inventoryLists,
            userID: userID,
            userFieldCandidates: inventoryUserFields,
            limit: 50
        )
        return documents.map { document in
            let data = document.data()
            let status = FirestoreValueDecoder.string(data[FirestoreSchema.InventoryFields.statusCandidates[0]]) ??
                FirestoreValueDecoder.string(data[FirestoreSchema.InventoryFields.statusCandidates[1]]) ?? "draft"
            let editable = status.lowercased() == "draft" ? "true" : "false"
            return TenantRecordItem(
                id: document.documentID,
                title: FirestoreValueDecoder.string(data[FirestoreSchema.InventoryFields.title]) ?? "Move-in Inventory",
                subtitle: "status: \(status) · edit_allowed: \(editable)"
            )
        }
    }
    #endif

    private func shortDate(_ date: Date?) -> String {
        guard let date else { return "N/A" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }

    private func currency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "en_US")
        return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
    }
}
