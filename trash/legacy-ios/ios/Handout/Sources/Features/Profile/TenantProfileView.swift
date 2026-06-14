import SwiftUI

struct TenantProfileView: View {
    @EnvironmentObject private var session: SessionManager

    var body: some View {
        List {
            Section("Account") {
                ProfileRow(key: "user_id", value: session.userID)
                ProfileRow(key: "role", value: session.roleDisplayName)
                ProfileRow(key: "email", value: session.userEmail.isEmpty ? "N/A" : session.userEmail)
                ProfileRow(key: "language", value: "en-US")
            }

            Section("Plan / Usage") {
                ProfileRow(key: "plan_code", value: "N/A")
                ProfileRow(key: "subscription_status", value: "N/A")
                ProfileRow(key: "credit_balance", value: "N/A")
            }

            Section("Actions") {
                Button("Reload Role From Server") {
                    Task {
                        await session.reloadRolesFromServer()
                    }
                }
                Menu("Manual Switch Role") {
                    ForEach(AppRole.allCases) { role in
                        Button(role.displayName) {
                            session.setRoleManually(to: role.rawValue)
                        }
                    }
                }
                if session.availableRoleCodes.count > 1 {
                    ForEach(session.availableRoleCodes, id: \.self) { role in
                        Button {
                            session.switchRole(to: role)
                        } label: {
                            HStack {
                                Text("Switch to \(AppRole(rawValue: role)?.displayName ?? role)")
                                Spacer()
                                if role == session.roleCode {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .disabled(role == session.roleCode)
                    }
                }
                Button("Switch Account") {
                    session.switchAccount()
                }
                Button("Sign Out", role: .destructive) {
                    session.signOut()
                }
            }
        }
        .navigationTitle("Profile")
    }
}

private struct ProfileRow: View {
    let key: String
    let value: String

    var body: some View {
        HStack {
            Text(key.humanizedFieldName)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
        }
        .font(.subheadline)
    }
}
