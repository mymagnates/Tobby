import Foundation

enum FirestorePaths {
    static func userProfile(_ userID: String) -> String {
        "users/\(userID)"
    }

    static func userRoles(_ userID: String) -> String {
        "users/\(userID)/roles"
    }

    static func property(_ propertyID: String) -> String {
        "properties/\(propertyID)"
    }

    static func transactions(_ propertyID: String) -> String {
        "properties/\(propertyID)/transactions"
    }

    static func tasks(_ propertyID: String) -> String {
        "properties/\(propertyID)/mxrecords"
    }

    static let leases = "leases"
}
