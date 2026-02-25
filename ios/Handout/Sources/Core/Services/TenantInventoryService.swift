import Foundation

#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

protocol TenantInventoryServiceProtocol {
    func fetchInventoryDetail(inventoryListID: String) async throws -> TenantInventoryDetail
    func saveDraft(inventory: TenantInventoryDetail) async throws
    func submitInventory(inventoryListID: String) async throws
}

final class TenantInventoryService: TenantInventoryServiceProtocol {
    private let inventoryUserFields = FirestoreSchema.InventoryFields.userCandidates

    func fetchInventoryDetail(inventoryListID: String) async throws -> TenantInventoryDetail {
        #if canImport(FirebaseFirestore)
        let snapshot = try await Firestore.firestore()
            .collection(FirestoreSchema.Collections.inventoryLists)
            .document(inventoryListID)
            .getDocument()
        let data = snapshot.data() ?? [:]
        let status = FirestoreValueDecoder.string(data[FirestoreSchema.InventoryFields.statusCandidates[0]]) ??
            FirestoreValueDecoder.string(data[FirestoreSchema.InventoryFields.statusCandidates[1]]) ?? "draft"
        let leaseID = FirestoreValueDecoder.string(data[FirestoreSchema.LeaseFields.leaseID]) ?? ""
        let updatedAt = FirestoreValueDecoder.date(data[FirestoreSchema.CommonFields.updatedAt])
        let rawItems = data[FirestoreSchema.InventoryFields.items] as? [[String: Any]] ?? []
        let items = rawItems.enumerated().map { idx, row in
            TenantInventoryItem(
                id: FirestoreValueDecoder.string(row["id"]) ?? "\(idx)",
                itemName: FirestoreValueDecoder.string(row[FirestoreSchema.InventoryFields.itemName]) ?? "",
                category: FirestoreValueDecoder.string(row[FirestoreSchema.InventoryFields.category]) ?? "",
                roomLocation: FirestoreValueDecoder.string(row[FirestoreSchema.InventoryFields.roomLocationCandidates[0]]) ??
                    FirestoreValueDecoder.string(row[FirestoreSchema.InventoryFields.roomLocationCandidates[1]]) ?? "",
                quantity: FirestoreValueDecoder.int(row[FirestoreSchema.InventoryFields.quantity]) ?? 1,
                condition: FirestoreValueDecoder.string(row[FirestoreSchema.InventoryFields.condition]) ?? "",
                notes: FirestoreValueDecoder.string(row[FirestoreSchema.InventoryFields.notes]) ?? ""
            )
        }
        return TenantInventoryDetail(
            inventoryListID: inventoryListID,
            leaseID: leaseID,
            status: status,
            updatedAt: updatedAt,
            items: items
        )
        #else
        return TenantInventoryDetail(
            inventoryListID: inventoryListID,
            leaseID: "",
            status: "draft",
            updatedAt: nil,
            items: []
        )
        #endif
    }

    func saveDraft(inventory: TenantInventoryDetail) async throws {
        #if canImport(FirebaseFirestore)
        let payload: [String: Any] = [
            FirestoreSchema.InventoryFields.statusCandidates[0]: "draft",
            FirestoreSchema.LeaseFields.leaseID: inventory.leaseID,
            FirestoreSchema.InventoryFields.items: inventory.items.map {
                [
                    "id": $0.id,
                    FirestoreSchema.InventoryFields.itemName: $0.itemName,
                    FirestoreSchema.InventoryFields.category: $0.category,
                    FirestoreSchema.InventoryFields.roomLocationCandidates[0]: $0.roomLocation,
                    FirestoreSchema.InventoryFields.quantity: $0.quantity,
                    FirestoreSchema.InventoryFields.condition: $0.condition,
                    FirestoreSchema.InventoryFields.notes: $0.notes
                ]
            },
            FirestoreSchema.CommonFields.updatedAt: FieldValue.serverTimestamp()
        ]
        try await Firestore.firestore()
            .collection(FirestoreSchema.Collections.inventoryLists)
            .document(inventory.inventoryListID)
            .setData(payload, merge: true)
        #else
        _ = inventory
        #endif
    }

    func submitInventory(inventoryListID: String) async throws {
        #if canImport(FirebaseFirestore)
        let detail = try await fetchInventoryDetail(inventoryListID: inventoryListID)
        guard detail.status.lowercased() == "draft" else {
            return
        }
        try await Firestore.firestore()
            .collection(FirestoreSchema.Collections.inventoryLists)
            .document(inventoryListID)
            .setData(
                [
                    FirestoreSchema.InventoryFields.statusCandidates[0]: "submitted",
                    FirestoreSchema.CommonFields.updatedAt: FieldValue.serverTimestamp()
                ],
                merge: true
            )
        #else
        _ = inventoryListID
        #endif
    }

    #if canImport(FirebaseFirestore)
    func fetchAssignedInventoryListIDs(userID: String) async throws -> Set<String> {
        let docs = try await FirestoreQueryHelper.collectionDocs(
            collectionID: FirestoreSchema.Collections.inventoryLists,
            userID: userID,
            userFieldCandidates: inventoryUserFields,
            limit: 200
        )
        return Set(docs.map(\.documentID))
    }
    #endif
}
