import Foundation
#if canImport(FirebaseAuth)
import FirebaseAuth
#endif
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

enum AppRole: String, CaseIterable, Identifiable {
    case tt = "TT"
    case pm = "PM"
    case po = "PO"
    case sp = "SP"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .tt: return "Tenant (TT)"
        case .pm: return "Property Manager (PM)"
        case .po: return "Property Owner (PO)"
        case .sp: return "Service Provider (SP)"
        }
    }

    var scope: RoleScope {
        switch self {
        case .tt: return .tenant
        case .pm, .po: return .pmPo
        case .sp: return .sp
        }
    }

    static func normalized(_ raw: String) -> [AppRole] {
        let value = raw.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        switch value {
        case "tt", "tenant", "tenant_user", "tenantuser":
            return [.tt]
        case "pm", "property_manager", "manager", "pmo":
            return [.pm]
        case "po", "owner", "property_owner":
            return [.po]
        case "sp", "service_provider", "vendor", "contractor", "sp_user":
            return [.sp]
        case "pm_po", "pm/po", "pmpo":
            return [.pm, .po]
        default:
            return []
        }
    }
}

enum RoleScope {
    case tenant
    case pmPo
    case sp
    case unknown
}

@MainActor
final class SessionManager: ObservableObject {
    private enum StorageKeys {
        static let userID = "session.userID"
        static let userEmail = "session.userEmail"
        static let roleCode = "session.roleCode"
        static let roleCodes = "session.roleCodes"
        static let isSignedIn = "session.isSignedIn"
        static let lastUsedEmail = "session.lastUsedEmail"
    }

    @Published var userID: String = ""
    @Published var userEmail: String = ""
    @Published var lastUsedEmail: String = ""
    @Published var roleCode: String = "TT"
    @Published var availableRoleCodes: [String] = ["TT"]
    @Published var isSignedIn: Bool = false
    @Published var isLoadingAuth: Bool = true
    @Published var authErrorMessage: String?

    private let authService: AuthService

    init(authService: AuthService) {
        self.authService = authService
        lastUsedEmail = UserDefaults.standard.string(forKey: StorageKeys.lastUsedEmail) ?? ""
        Task { await bootstrapSession() }
    }

    var roleScope: RoleScope {
        guard let role = AppRole(rawValue: roleCode) else { return .unknown }
        return role.scope
    }

    var roleDisplayName: String {
        AppRole(rawValue: roleCode)?.displayName ?? roleCode
    }

    func bootstrapSession() async {
        defer { isLoadingAuth = false }
        if let uid = authService.currentAuthUserID(), !uid.isEmpty {
            userID = uid
            userEmail = authService.currentAuthEmail() ?? (UserDefaults.standard.string(forKey: StorageKeys.userEmail) ?? "")
            hydrateRoleCacheFromLocal()
            isSignedIn = true
            await refreshRolesFromBackend()
            persistSession()
            return
        }

        // Local persistent fallback (useful before Firebase SDK is configured).
        let defaults = UserDefaults.standard
        if defaults.bool(forKey: StorageKeys.isSignedIn),
           let persistedUserID = defaults.string(forKey: StorageKeys.userID),
           !persistedUserID.isEmpty {
            userID = persistedUserID
            userEmail = defaults.string(forKey: StorageKeys.userEmail) ?? ""
            hydrateRoleCacheFromLocal()
            isSignedIn = true
        }
    }

    func signIn(email: String, password: String) async {
        authErrorMessage = nil
        do {
            try await authService.signIn(email: email, password: password)
            userID = authService.currentAuthUserID() ?? ""
            userEmail = authService.currentAuthEmail() ?? email
            lastUsedEmail = email
            isSignedIn = true
            await refreshRolesFromBackend()
            persistSession()
        } catch {
            isSignedIn = false
            authErrorMessage = error.localizedDescription
        }
    }

    func signOut() {
        clearSession(keepLastEmail: true)
    }

    func switchAccount() {
        clearSession(keepLastEmail: true)
    }

    func switchRole(to newRoleCode: String) {
        let normalized = AppRole.normalized(newRoleCode).first?.rawValue ?? newRoleCode.uppercased()
        guard availableRoleCodes.contains(normalized), normalized != roleCode else { return }
        roleCode = normalized
        persistSession()
    }

    func setRoleManually(to newRoleCode: String) {
        guard let normalized = AppRole.normalized(newRoleCode).first?.rawValue else { return }
        if !availableRoleCodes.contains(normalized) {
            availableRoleCodes.append(normalized)
            availableRoleCodes = normalizedRoleCodes(from: availableRoleCodes)
        }
        roleCode = normalized
        persistSession()
    }

    func reloadRolesFromServer() async {
        await refreshRolesFromBackend()
    }

    private func clearSession(keepLastEmail: Bool) {
        do {
            try authService.signOut()
        } catch {
            authErrorMessage = error.localizedDescription
        }
        userID = ""
        userEmail = ""
        isSignedIn = false
        let defaults = UserDefaults.standard
        defaults.removeObject(forKey: StorageKeys.userID)
        defaults.removeObject(forKey: StorageKeys.userEmail)
        defaults.removeObject(forKey: StorageKeys.roleCode)
        defaults.removeObject(forKey: StorageKeys.roleCodes)
        defaults.set(false, forKey: StorageKeys.isSignedIn)
        availableRoleCodes = ["TT"]
        roleCode = "TT"
        if !keepLastEmail {
            lastUsedEmail = ""
            defaults.removeObject(forKey: StorageKeys.lastUsedEmail)
        }
    }

    private func persistSession() {
        let defaults = UserDefaults.standard
        defaults.set(userID, forKey: StorageKeys.userID)
        defaults.set(userEmail, forKey: StorageKeys.userEmail)
        defaults.set(roleCode, forKey: StorageKeys.roleCode)
        defaults.set(availableRoleCodes.joined(separator: ","), forKey: StorageKeys.roleCodes)
        defaults.set(isSignedIn, forKey: StorageKeys.isSignedIn)
        defaults.set(lastUsedEmail, forKey: StorageKeys.lastUsedEmail)
    }

    private func hydrateRoleCacheFromLocal() {
        let defaults = UserDefaults.standard
        let persistedRole = defaults.string(forKey: StorageKeys.roleCode) ?? "TT"
        let persistedRoleCodes = defaults.string(forKey: StorageKeys.roleCodes) ?? persistedRole
        let normalizedRoles = normalizedRoleCodes(from: persistedRoleCodes.split(separator: ",").map(String.init))
        availableRoleCodes = normalizedRoles.isEmpty ? ["TT"] : normalizedRoles
        roleCode = availableRoleCodes.contains(persistedRole) ? persistedRole : (availableRoleCodes.first ?? "TT")
    }

    private func refreshRolesFromBackend() async {
        guard !userID.isEmpty else { return }
        let response = await fetchRoleResponseFromBackend(userID: userID)
        guard !response.roles.isEmpty else { return }
        availableRoleCodes = response.roles

        if let preferred = response.preferredRole, availableRoleCodes.contains(preferred) {
            roleCode = preferred
        } else if availableRoleCodes.contains(roleCode) {
            // Keep current role if still valid.
        } else {
            roleCode = pickDefaultRole(from: availableRoleCodes)
        }
        persistSession()
    }

    private func normalizedRoleCodes(from rawRoles: [String]) -> [String] {
        var ordered: [String] = []
        for value in rawRoles {
            for role in AppRole.normalized(value) where !ordered.contains(role.rawValue) {
                ordered.append(role.rawValue)
            }
        }
        if ordered.isEmpty {
            return []
        }
        // Business rule: TT and PM/PO are mutually exclusive for one account.
        if ordered.contains("PM") || ordered.contains("PO") {
            ordered.removeAll { $0 == "TT" }
        }
        let rank: [String: Int] = ["TT": 0, "PM": 1, "PO": 2, "SP": 3]
        return ordered.sorted { (rank[$0] ?? 99) < (rank[$1] ?? 99) }
    }

    private struct RoleFetchResponse {
        let roles: [String]
        let preferredRole: String?
    }

    private func fetchRoleResponseFromBackend(userID: String) async -> RoleFetchResponse {
        var rawRoles: [String] = []
        var preferredRole: String?
        #if canImport(FirebaseAuth)
        if let authUser = Auth.auth().currentUser {
            do {
                let token = try await authUser.getIDTokenResult(forcingRefresh: false)
                if let role = token.claims["role"] as? String {
                    rawRoles.append(role)
                }
                if let roles = token.claims["roles"] as? [String] {
                    rawRoles.append(contentsOf: roles)
                }
                if let raw = token.claims["active_role"] as? String,
                   let normalized = AppRole.normalized(raw).first?.rawValue {
                    preferredRole = normalized
                } else if let raw = token.claims["default_role"] as? String,
                          let normalized = AppRole.normalized(raw).first?.rawValue {
                    preferredRole = normalized
                }
            } catch {
                authErrorMessage = error.localizedDescription
            }
        }
        #endif

        #if canImport(FirebaseFirestore)
        do {
            let db = Firestore.firestore()
            let userSnapshot = try await db.collection(FirestoreSchema.Collections.users).document(userID).getDocument()
            if let data = userSnapshot.data() {
                rawRoles.append(contentsOf: parseRoleStrings(from: data))
                if preferredRole == nil {
                    preferredRole = parsePreferredRole(from: data)
                }
            }

            let rolesSnapshot = try await db.collection(FirestoreSchema.Collections.users).document(userID).collection("roles").limit(to: 20).getDocuments()
            for doc in rolesSnapshot.documents {
                rawRoles.append(doc.documentID)
                rawRoles.append(contentsOf: parseRoleStrings(from: doc.data()))
                if preferredRole == nil {
                    preferredRole = parsePreferredRole(from: doc.data())
                }
            }
        } catch {
            if authErrorMessage == nil {
                authErrorMessage = error.localizedDescription
            }
        }
        #endif

        let normalized = normalizedRoleCodes(from: rawRoles)
        let normalizedPreferred: String?
        if let preferredRole {
            normalizedPreferred = AppRole.normalized(preferredRole).first?.rawValue
        } else {
            normalizedPreferred = nil
        }
        return RoleFetchResponse(roles: normalized, preferredRole: normalizedPreferred)
    }

    private func parseRoleStrings(from payload: [String: Any]) -> [String] {
        var rawRoles: [String] = []
        let singleKeyCandidates = ["role", "role_code", "user_role", "role_type", "type", "name", "code"]
        for key in singleKeyCandidates {
            if let value = payload[key] as? String {
                rawRoles.append(value)
            }
        }
        let arrayKeyCandidates = ["roles", "role_codes", "user_roles"]
        for key in arrayKeyCandidates {
            if let values = payload[key] as? [String] {
                rawRoles.append(contentsOf: values)
            }
        }
        if let map = payload["roles"] as? [String: Any] {
            for (key, value) in map where FirestoreValueDecoder.bool(value) ?? false {
                rawRoles.append(key)
            }
        }
        // Handle nested payloads, but only through known role containers.
        let nestedKeyCandidates = ["auth", "rbac", "profile", "membership", "memberships", "account", "claims"]
        for key in nestedKeyCandidates {
            guard let value = payload[key] else { continue }
            if let nested = value as? [String: Any] {
                rawRoles.append(contentsOf: parseRoleStrings(from: nested))
            } else if let array = value as? [[String: Any]] {
                for item in array {
                    rawRoles.append(contentsOf: parseRoleStrings(from: item))
                }
            }
        }
        return rawRoles
    }

    private func parsePreferredRole(from payload: [String: Any]) -> String? {
        let preferredKeys = ["active_role", "current_role", "default_role", "selected_role", "primary_role"]
        for key in preferredKeys {
            if let raw = payload[key] as? String,
               let normalized = AppRole.normalized(raw).first?.rawValue {
                return normalized
            }
        }
        return nil
    }

    private func pickDefaultRole(from roles: [String]) -> String {
        let priority = ["PM", "PO", "SP", "TT"]
        for candidate in priority where roles.contains(candidate) {
            return candidate
        }
        return roles.first ?? "TT"
    }
}
