import Foundation

enum FirestoreSchema {
    enum Collections {
        static let users = "users"
        static let inbox = "inbox"
        static let properties = "properties"
        static let inventoryLists = "inventory_lists"
        static let leases = "leases"
        static let mxrecords = "mxrecords"
        static let transactions = "transactions"
        static let reminders = "reminders"
        static let spCards = "sp_cards"
    }

    enum CommonFields {
        static let userIDCandidates = ["user_id", "tenant_id", "created_by"]
        static let updatedAt = "updated_at"
        static let status = "status"
    }

    enum TaskFields {
        static let createdByCandidates = ["created_by", "creator_id", "tenant_id", "user_id"]
        static let titleCandidates = ["task_title", "title"]
        static let description = "task_description"
        static let category = "task_category"
        static let priorityCandidates = ["task_priority", "priority"]
        static let propertyID = "property_id"
        static let unitID = "unit_id"
        static let photos = "photos"
        static let photoCount = "photo_count"
    }

    enum LeaseFields {
        static let userCandidates = ["tenant_id", "user_id", "created_by"]
        static let startDate = "start_date"
        static let endDate = "end_date"
        static let dueDate = "due_date"
        static let leaseID = "lease_id"
    }

    enum TransactionFields {
        static let userCandidates = ["tenant_id", "user_id", "created_by"]
        static let typeCandidates = ["transaction_type", "type"]
        static let amount = "amount"
        static let dateCandidates = ["transaction_date", "date"]
        static let method = "method"
    }

    enum InboxFields {
        static let userCandidates = ["user_id", "to_user_id", "tenant_id"]
        static let messageType = "message_type"
        static let messageTitle = "message_title"
        static let messageBody = "message_body"
        static let createdAt = "created_at"
        static let isRead = "is_read"
    }

    enum InventoryFields {
        static let userCandidates = ["assigned_tenant_id", "tenant_id", "user_id"]
        static let statusCandidates = ["inventory_status", "status"]
        static let items = "items"
        static let title = "title"
        static let itemName = "item_name"
        static let category = "category"
        static let roomLocationCandidates = ["room_location", "room"]
        static let quantity = "quantity"
        static let condition = "condition"
        static let notes = "notes"
    }
}
