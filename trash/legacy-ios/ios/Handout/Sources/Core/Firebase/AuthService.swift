import Foundation

#if canImport(FirebaseAuth)
import FirebaseAuth
#endif

@MainActor
final class AuthService: ObservableObject {
    @Published private(set) var currentUserID: String?
    @Published private(set) var currentEmail: String?
    @Published private(set) var isAuthenticated: Bool = false

    func signIn(email: String, password: String) async throws {
        #if canImport(FirebaseAuth)
        let result = try await Auth.auth().signIn(withEmail: email, password: password)
        currentUserID = result.user.uid
        currentEmail = result.user.email ?? email
        isAuthenticated = true
        #else
        _ = password
        currentUserID = "local-dev-user"
        currentEmail = email
        isAuthenticated = true
        #endif
    }

    func signOut() throws {
        #if canImport(FirebaseAuth)
        try Auth.auth().signOut()
        #endif
        currentUserID = nil
        currentEmail = nil
        isAuthenticated = false
    }

    func currentAuthUserID() -> String? {
        #if canImport(FirebaseAuth)
        return Auth.auth().currentUser?.uid
        #else
        return currentUserID
        #endif
    }

    func currentAuthEmail() -> String? {
        #if canImport(FirebaseAuth)
        return Auth.auth().currentUser?.email
        #else
        return currentEmail
        #endif
    }
}
