import Foundation

struct TenantInboxMessage: Identifiable {
    let id: String
    let messageType: String
    let messageTitle: String
    let messageBody: String
    let createdAt: Date?
    var isRead: Bool
}
