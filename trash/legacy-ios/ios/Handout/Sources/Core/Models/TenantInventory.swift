import Foundation

struct TenantInventoryItem: Identifiable, Hashable {
    var id: String
    var itemName: String
    var category: String
    var roomLocation: String
    var quantity: Int
    var condition: String
    var notes: String
}

struct TenantInventoryDetail {
    var inventoryListID: String
    var leaseID: String
    var status: String
    var updatedAt: Date?
    var items: [TenantInventoryItem]

    var isEditable: Bool {
        status.lowercased() == "draft"
    }
}
