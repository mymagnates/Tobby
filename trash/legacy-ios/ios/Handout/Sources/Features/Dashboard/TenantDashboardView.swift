import SwiftUI

@MainActor
final class TenantDashboardViewModel: ObservableObject {
    @Published private(set) var snapshot: TenantDashboardSnapshot = .empty
    @Published private(set) var isLoading: Bool = false
    @Published var errorMessage: String?

    private let service: TenantDashboardServiceProtocol

    init(service: TenantDashboardServiceProtocol = TenantDashboardService()) {
        self.service = service
    }

    func load(userID: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            snapshot = try await service.fetchDashboard(userID: userID)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct TenantDashboardView: View {
    @EnvironmentObject private var session: SessionManager
    @StateObject private var viewModel = TenantDashboardViewModel()

    var body: some View {
        List {
            Section("Lease") {
                KeyValueRow(key: "rent_due_date", value: dateText(viewModel.snapshot.rentDueDate))
                KeyValueRow(key: "rent_due_in_days", value: rentDueInDaysText(viewModel.snapshot.rentDueDate))
                KeyValueRow(key: "lease_start_date", value: dateText(viewModel.snapshot.leaseStartDate))
                KeyValueRow(key: "lease_end_date", value: dateText(viewModel.snapshot.leaseEndDate))
            }

            Section("My Tasks") {
                KeyValueRow(key: "my_tasks_open_count", value: "\(viewModel.snapshot.myTasksOpenCount)")
                KeyValueRow(key: "my_tasks_in_progress_count", value: "\(viewModel.snapshot.myTasksInProgressCount)")
                KeyValueRow(key: "my_tasks_resolved_count", value: "\(viewModel.snapshot.myTasksResolvedCount)")
            }

            Section("Payments") {
                KeyValueRow(key: "latest_payment_amount", value: currencyText(viewModel.snapshot.latestPaymentAmount))
                KeyValueRow(key: "latest_payment_date", value: dateText(viewModel.snapshot.latestPaymentDate))
                KeyValueRow(key: "latest_receipt_amount", value: currencyText(viewModel.snapshot.latestReceiptAmount))
                KeyValueRow(key: "latest_receipt_date", value: dateText(viewModel.snapshot.latestReceiptDate))
            }

            if let errorMessage = viewModel.errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.footnote)
                }
            }
        }
        .navigationTitle("Dashboard")
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
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }

    private func currencyText(_ amount: Double?) -> String {
        guard let amount else { return "N/A" }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "en_US")
        return formatter.string(from: NSNumber(value: amount)) ?? "\(amount)"
    }

    private func rentDueInDaysText(_ rentDueDate: Date?) -> String {
        guard let rentDueDate else { return "N/A" }
        let days = Calendar.current.dateComponents([.day], from: Date(), to: rentDueDate).day ?? 0
        return "\(max(days, 0))"
    }
}

private struct KeyValueRow: View {
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
