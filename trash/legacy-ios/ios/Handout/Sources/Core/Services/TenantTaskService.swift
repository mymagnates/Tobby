import Foundation

#if canImport(FirebaseAuth) && canImport(FirebaseFirestore)
import FirebaseAuth
import FirebaseFirestore
#endif
#if canImport(FirebaseStorage)
import FirebaseStorage
#endif

protocol TenantTaskServiceProtocol {
    func saveDraft(_ draft: TenantTaskDraft, photos: [Data], onProgress: ((Double) -> Void)?) async throws
    func submitTask(_ draft: TenantTaskDraft, photos: [Data], onProgress: ((Double) -> Void)?) async throws
}

enum TenantTaskError: LocalizedError {
    case validationFailed(String)

    var errorDescription: String? {
        switch self {
        case .validationFailed(let message):
            return message
        }
    }
}

final class TenantTaskService: TenantTaskServiceProtocol {
    func saveDraft(_ draft: TenantTaskDraft, photos: [Data], onProgress: ((Double) -> Void)? = nil) async throws {
        try validate(draft, forSubmit: false)
        try await persist(draft: draft, photos: photos, status: "draft", onProgress: onProgress)
    }

    func submitTask(_ draft: TenantTaskDraft, photos: [Data], onProgress: ((Double) -> Void)? = nil) async throws {
        try validate(draft, forSubmit: true)
        try await persist(draft: draft, photos: photos, status: "submitted", onProgress: onProgress)
    }

    private func validate(_ draft: TenantTaskDraft, forSubmit: Bool) throws {
        if forSubmit {
            if draft.taskTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                throw TenantTaskError.validationFailed("Task Title is required.")
            }
            if draft.taskDescription.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                throw TenantTaskError.validationFailed("Task Description is required.")
            }
            if draft.propertyID.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                throw TenantTaskError.validationFailed("Property ID is required for submit.")
            }
        }
        if draft.photoCount > 6 {
            throw TenantTaskError.validationFailed("Photos max is 6 per task.")
        }
    }

    private func persist(draft: TenantTaskDraft, photos: [Data], status: String, onProgress: ((Double) -> Void)?) async throws {
        #if canImport(FirebaseAuth) && canImport(FirebaseFirestore)
        let userID = Auth.auth().currentUser?.uid ?? "unknown-user"
        let propertyID = draft.propertyID.trimmingCharacters(in: .whitespacesAndNewlines)
        let finalPropertyID = propertyID.isEmpty ? "_unknown_property_" : propertyID
        let photoURLs = try await uploadPhotos(photos, propertyID: finalPropertyID, onProgress: onProgress)
        let payload: [String: Any] = [
            FirestoreSchema.TaskFields.titleCandidates[0]: draft.taskTitle,
            FirestoreSchema.TaskFields.description: draft.taskDescription,
            FirestoreSchema.TaskFields.category: draft.taskCategory,
            FirestoreSchema.TaskFields.priorityCandidates[0]: draft.taskPriority.rawValue,
            FirestoreSchema.TaskFields.propertyID: finalPropertyID,
            FirestoreSchema.TaskFields.unitID: draft.unitID,
            FirestoreSchema.TaskFields.photoCount: photoURLs.count,
            FirestoreSchema.TaskFields.photos: photoURLs,
            FirestoreSchema.CommonFields.status: status,
            FirestoreSchema.TaskFields.createdByCandidates[0]: userID,
            FirestoreSchema.CommonFields.updatedAt: FieldValue.serverTimestamp()
        ]
        try await withRetry(maxAttempts: 3) {
            try await Firestore.firestore()
                .collection(FirestorePaths.tasks(finalPropertyID))
                .addDocument(data: payload)
        }
        #else
        _ = (draft, photos, status, onProgress)
        #endif
    }

    private func uploadPhotos(_ photos: [Data], propertyID: String, onProgress: ((Double) -> Void)?) async throws -> [String] {
        #if canImport(FirebaseStorage)
        guard !photos.isEmpty else { return [] }
        var urls: [String] = []
        for (index, photo) in photos.enumerated() {
            let path = "images/\(propertyID)/task/\(UUID().uuidString).jpg"
            let ref = Storage.storage().reference(withPath: path)
            let metadata = StorageMetadata()
            metadata.contentType = "image/jpeg"
            _ = try await withRetry(maxAttempts: 3) {
                try await ref.putDataAsync(photo, metadata: metadata)
            }
            let url = try await withRetry(maxAttempts: 3) {
                try await ref.downloadURL()
            }
            urls.append(url.absoluteString)
            onProgress?(Double(index + 1) / Double(photos.count))
        }
        return urls
        #else
        _ = (photos, propertyID, onProgress)
        return []
        #endif
    }

    private func withRetry<T>(maxAttempts: Int, operation: () async throws -> T) async throws -> T {
        var attempt = 0
        while true {
            do {
                return try await operation()
            } catch {
                attempt += 1
                if attempt >= maxAttempts {
                    throw error
                }
                let delayNs = UInt64(attempt) * 500_000_000
                try await Task.sleep(nanoseconds: delayNs)
            }
        }
    }
}
