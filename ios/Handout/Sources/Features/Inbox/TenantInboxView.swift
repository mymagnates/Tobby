import SwiftUI

@MainActor
final class TenantInboxViewModel: ObservableObject {
    @Published private(set) var messages: [TenantInboxMessage] = []
    @Published private(set) var isLoading: Bool = false
    @Published var errorMessage: String?

    private let service: TenantInboxServiceProtocol

    init(service: TenantInboxServiceProtocol = TenantInboxService()) {
        self.service = service
    }

    func load(userID: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            messages = try await service.fetchMessages(userID: userID)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func markAsRead(userID: String, messageID: String) async {
        do {
            try await service.markAsRead(userID: userID, messageID: messageID)
            if let index = messages.firstIndex(where: { $0.id == messageID }) {
                messages[index].isRead = true
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct TenantInboxView: View {
    @EnvironmentObject private var session: SessionManager
    @StateObject private var viewModel = TenantInboxViewModel()

    var body: some View {
        List {
            ForEach(viewModel.messages.indices, id: \.self) { index in
                VStack(alignment: .leading, spacing: 6) {
                    Text(viewModel.messages[index].messageTitle)
                        .font(.headline)
                    Text(viewModel.messages[index].messageBody)
                        .font(.subheadline)
                    HStack {
                        Text(viewModel.messages[index].messageType)
                        Spacer()
                        Text(dateText(viewModel.messages[index].createdAt))
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    Button(viewModel.messages[index].isRead ? "Open Detail" : "Mark as Read") {
                        if !viewModel.messages[index].isRead {
                            Task {
                                await viewModel.markAsRead(userID: session.userID, messageID: viewModel.messages[index].id)
                            }
                        }
                    }
                    .buttonStyle(.borderless)
                }
            }

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .foregroundStyle(.red)
                    .font(.footnote)
            }
        }
        .navigationTitle("Inbox")
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .task(id: session.userID) {
            guard !session.userID.isEmpty else { return }
            await viewModel.load(userID: session.userID)
        }
    }

    private func dateText(_ date: Date?) -> String {
        guard let date else { return "N/A" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}
