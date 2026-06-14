import SwiftUI

@MainActor
final class TenantRecordsViewModel: ObservableObject {
    @Published private(set) var snapshot: TenantRecordsSnapshot = .empty
    @Published private(set) var isLoading: Bool = false
    @Published var errorMessage: String?

    private let service: TenantRecordsServiceProtocol

    init(service: TenantRecordsServiceProtocol = TenantRecordsService()) {
        self.service = service
    }

    func load(userID: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            snapshot = try await service.fetchRecords(userID: userID)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct TenantRecordsView: View {
    @EnvironmentObject private var session: SessionManager
    @StateObject private var viewModel = TenantRecordsViewModel()

    var body: some View {
        List {
            Section("My Tasks") {
                if viewModel.snapshot.taskItems.isEmpty {
                    Text("No records.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(viewModel.snapshot.taskItems) { item in
                        RecordRow(title: item.title, subtitle: item.subtitle)
                    }
                }
            }

            Section("Payments / Receipts") {
                if viewModel.snapshot.transactionItems.isEmpty {
                    Text("No records.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(viewModel.snapshot.transactionItems) { item in
                        RecordRow(title: item.title, subtitle: item.subtitle)
                    }
                }
            }

            Section("Lease Info") {
                if viewModel.snapshot.leaseItems.isEmpty {
                    Text("No records.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(viewModel.snapshot.leaseItems) { item in
                        RecordRow(title: item.title, subtitle: item.subtitle)
                    }
                }
            }

            Section("Inventory") {
                if viewModel.snapshot.inventoryItems.isEmpty {
                    Text("No records.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(viewModel.snapshot.inventoryItems) { item in
                        NavigationLink {
                            TenantInventoryDetailView(userID: session.userID, inventoryListID: item.id)
                        } label: {
                            RecordRow(title: item.title, subtitle: item.subtitle)
                        }
                    }
                }
                Text("submitted status will be read-only for TT.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .foregroundStyle(.red)
                    .font(.footnote)
            }
        }
        .navigationTitle("Records")
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
}

private struct RecordRow: View {
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
            Text(subtitle)
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
    }
}
