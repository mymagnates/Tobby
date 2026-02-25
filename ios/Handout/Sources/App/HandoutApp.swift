import SwiftUI

@main
struct HandoutApp: App {
    @StateObject private var session = SessionManager(authService: AuthService())

    init() {
        FirebaseManager.configure()
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if session.isLoadingAuth {
                    ProgressView("Loading session...")
                } else if session.isSignedIn {
                    RoleBasedRootView()
                } else {
                    LoginView()
                }
            }
            .environmentObject(session)
        }
    }
}
