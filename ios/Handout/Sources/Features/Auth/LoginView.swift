import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var session: SessionManager
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var isSubmitting: Bool = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    BrandLogoView()
                        .listRowBackground(Color.clear)
                }

                Section("Sign In") {
                    TextField("Email", text: $email)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                    SecureField("Password", text: $password)
                    if !session.lastUsedEmail.isEmpty {
                        Button("Use Last Account: \(session.lastUsedEmail)") {
                            email = session.lastUsedEmail
                        }
                        .font(.footnote)
                    }
                }

                Section {
                    Button("Sign In") {
                        Task {
                            isSubmitting = true
                            defer { isSubmitting = false }
                            await session.signIn(email: email, password: password)
                        }
                    }
                    .disabled(isSubmitting || email.isEmpty || password.isEmpty)
                }

                if let authError = session.authErrorMessage {
                    Section {
                        Text(authError)
                            .foregroundStyle(.red)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle("Handout")
            .onAppear {
                if email.isEmpty {
                    email = session.lastUsedEmail
                }
            }
        }
    }
}
