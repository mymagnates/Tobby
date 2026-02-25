import Foundation

#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

enum FirestoreQueryHelper {
    enum QueryError: LocalizedError {
        case allCandidatesFailed(collectionID: String, fields: [String], reason: String)

        var errorDescription: String? {
            switch self {
            case let .allCandidatesFailed(collectionID, fields, reason):
                return "Firestore query failed for \(collectionID) with fields \(fields.joined(separator: ", ")): \(reason)"
            }
        }
    }

    #if canImport(FirebaseFirestore)
    static func collectionGroupDocs(
        collectionID: String,
        userID: String,
        userFieldCandidates: [String],
        limit: Int = 100
    ) async throws -> [QueryDocumentSnapshot] {
        var merged: [String: QueryDocumentSnapshot] = [:]
        var hadSuccessfulQuery = false
        var lastError: Error?
        for field in userFieldCandidates {
            do {
                let snapshot = try await Firestore.firestore()
                    .collectionGroup(collectionID)
                    .whereField(field, isEqualTo: userID)
                    .limit(to: limit)
                    .getDocuments()
                hadSuccessfulQuery = true
                for doc in snapshot.documents {
                    merged[doc.reference.path] = doc
                }
            } catch {
                lastError = error
            }
        }
        if !hadSuccessfulQuery {
            throw QueryError.allCandidatesFailed(
                collectionID: collectionID,
                fields: userFieldCandidates,
                reason: lastError?.localizedDescription ?? "Unknown error"
            )
        }
        return Array(merged.values)
    }

    static func collectionDocs(
        collectionID: String,
        userID: String,
        userFieldCandidates: [String],
        limit: Int = 100
    ) async throws -> [QueryDocumentSnapshot] {
        var merged: [String: QueryDocumentSnapshot] = [:]
        var hadSuccessfulQuery = false
        var lastError: Error?
        for field in userFieldCandidates {
            do {
                let snapshot = try await Firestore.firestore()
                    .collection(collectionID)
                    .whereField(field, isEqualTo: userID)
                    .limit(to: limit)
                    .getDocuments()
                hadSuccessfulQuery = true
                for doc in snapshot.documents {
                    merged[doc.reference.path] = doc
                }
            } catch {
                lastError = error
            }
        }
        if !hadSuccessfulQuery {
            throw QueryError.allCandidatesFailed(
                collectionID: collectionID,
                fields: userFieldCandidates,
                reason: lastError?.localizedDescription ?? "Unknown error"
            )
        }
        return Array(merged.values)
    }
    #endif
}
