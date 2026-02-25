import Foundation

#if canImport(FirebaseCore)
import FirebaseCore
#endif

enum FirebaseManager {
    static func configure() {
        #if canImport(FirebaseCore)
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }
        #endif
    }
}
