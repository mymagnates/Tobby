import Foundation

#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

protocol TenantInboxServiceProtocol {
    func fetchMessages(userID: String) async throws -> [TenantInboxMessage]
    func markAsRead(userID: String, messageID: String) async throws
}

final class TenantInboxService: TenantInboxServiceProtocol {
    func fetchMessages(userID: String) async throws -> [TenantInboxMessage] {
        #if canImport(FirebaseFirestore)
        var merged: [String: TenantInboxMessage] = [:]

        do {
            let snapshot = try await Firestore.firestore()
                .collection(FirestoreSchema.Collections.users)
                .document(userID)
                .collection(FirestoreSchema.Collections.inbox)
                .order(by: FirestoreSchema.InboxFields.createdAt, descending: true)
                .limit(to: 50)
                .getDocuments()

            for document in snapshot.documents {
                let data = document.data()
                merged[document.reference.path] = TenantInboxMessage(
                    id: document.documentID,
                    messageType: FirestoreValueDecoder.string(data[FirestoreSchema.InboxFields.messageType]) ?? "system",
                    messageTitle: FirestoreValueDecoder.string(data[FirestoreSchema.InboxFields.messageTitle]) ?? "Untitled",
                    messageBody: FirestoreValueDecoder.string(data[FirestoreSchema.InboxFields.messageBody]) ?? "",
                    createdAt: FirestoreValueDecoder.date(data[FirestoreSchema.InboxFields.createdAt]),
                    isRead: FirestoreValueDecoder.bool(data[FirestoreSchema.InboxFields.isRead]) ?? false
                )
            }
        } catch {
            // Fall through to global inbox fallback query.
        }

        let fallbackDocs = try await FirestoreQueryHelper.collectionDocs(
            collectionID: FirestoreSchema.Collections.inbox,
            userID: userID,
            userFieldCandidates: FirestoreSchema.InboxFields.userCandidates,
            limit: 50
        )
        for document in fallbackDocs {
            let data = document.data()
            merged[document.reference.path] = TenantInboxMessage(
                id: document.documentID,
                messageType: FirestoreValueDecoder.string(data[FirestoreSchema.InboxFields.messageType]) ?? "system",
                messageTitle: FirestoreValueDecoder.string(data[FirestoreSchema.InboxFields.messageTitle]) ?? "Untitled",
                messageBody: FirestoreValueDecoder.string(data[FirestoreSchema.InboxFields.messageBody]) ?? "",
                createdAt: FirestoreValueDecoder.date(data[FirestoreSchema.InboxFields.createdAt]),
                isRead: FirestoreValueDecoder.bool(data[FirestoreSchema.InboxFields.isRead]) ?? false
            )
        }

        return merged.values.sorted { lhs, rhs in
            (lhs.createdAt ?? .distantPast) > (rhs.createdAt ?? .distantPast)
        }
        #else
        _ = userID
        return []
        #endif
    }

    func markAsRead(userID: String, messageID: String) async throws {
        #if canImport(FirebaseFirestore)
        let payload: [String: Any] = [FirestoreSchema.InboxFields.isRead: true, FirestoreSchema.CommonFields.updatedAt: FieldValue.serverTimestamp()]
        do {
            try await Firestore.firestore()
                .collection(FirestoreSchema.Collections.users)
                .document(userID)
                .collection(FirestoreSchema.Collections.inbox)
                .document(messageID)
                .setData(payload, merge: true)
        } catch {
            try await Firestore.firestore()
                .collection(FirestoreSchema.Collections.inbox)
                .document(messageID)
                .setData(payload, merge: true)
        }
        #else
        _ = (userID, messageID)
        #endif
    }
}
