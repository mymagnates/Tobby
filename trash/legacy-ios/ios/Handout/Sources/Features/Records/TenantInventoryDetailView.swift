import SwiftUI

@MainActor
final class TenantInventoryDetailViewModel: ObservableObject {
    @Published var inventory: TenantInventoryDetail?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var actionMessage: String?

    private let service: TenantInventoryServiceProtocol
    private let inventoryListID: String
    private let userID: String

    init(
        userID: String,
        inventoryListID: String,
        service: TenantInventoryServiceProtocol = TenantInventoryService()
    ) {
        self.userID = userID
        self.inventoryListID = inventoryListID
        self.service = service
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            #if canImport(FirebaseFirestore)
            if let inventoryService = service as? TenantInventoryService {
                let allowedIDs = try await inventoryService.fetchAssignedInventoryListIDs(userID: userID)
                if !allowedIDs.contains(inventoryListID) {
                    errorMessage = "Access denied: inventory is out of TT self scope."
                    return
                }
            }
            #endif
            inventory = try await service.fetchInventoryDetail(inventoryListID: inventoryListID)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func saveDraft() async {
        guard let inventory else { return }
        do {
            try await service.saveDraft(inventory: inventory)
            actionMessage = "Save Draft completed."
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func submitInventory() async {
        guard let inventory else { return }
        do {
            try await service.submitInventory(inventoryListID: inventory.inventoryListID)
            actionMessage = "Inventory Submit completed."
            await load()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addItem() {
        guard var inventory, inventory.isEditable else { return }
        inventory.items.append(
            TenantInventoryItem(
                id: UUID().uuidString,
                itemName: "",
                category: "",
                roomLocation: "",
                quantity: 1,
                condition: "",
                notes: ""
            )
        )
        self.inventory = inventory
    }
}

struct TenantInventoryDetailView: View {
    @StateObject private var viewModel: TenantInventoryDetailViewModel

    init(userID: String, inventoryListID: String) {
        _viewModel = StateObject(wrappedValue: TenantInventoryDetailViewModel(userID: userID, inventoryListID: inventoryListID))
    }

    var body: some View {
        List {
            if let inventory = viewModel.inventory {
                Section("Meta") {
                    Text("Inventory List ID: \(inventory.inventoryListID)")
                    Text("Lease ID: \(inventory.leaseID)")
                    Text("Inventory Status: \(inventory.status.humanizedFieldName)")
                }

                Section("Items") {
                    if inventory.items.isEmpty {
                        Text("No items.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(inventory.items.indices, id: \.self) { index in
                            InventoryItemEditor(
                                item: bindingForItem(at: index),
                                editable: inventory.isEditable
                            )
                        }
                    }
                }

                if inventory.isEditable {
                    Section("Actions") {
                        Button("Add Item") {
                            viewModel.addItem()
                        }
                        Button("Save Draft") {
                            Task { await viewModel.saveDraft() }
                        }
                        Button("Submit Inventory") {
                            Task { await viewModel.submitInventory() }
                        }
                    }
                } else {
                    Section {
                        Text("submitted inventory is read-only for TT.")
                            .foregroundStyle(.secondary)
                    }
                }
            }

            if let actionMessage = viewModel.actionMessage {
                Text(actionMessage)
                    .foregroundStyle(.green)
                    .font(.footnote)
            }

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .foregroundStyle(.red)
                    .font(.footnote)
            }
        }
        .navigationTitle("Inventory Detail")
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .task {
            await viewModel.load()
        }
    }

    private func bindingForItem(at index: Int) -> Binding<TenantInventoryItem> {
        Binding {
            viewModel.inventory?.items[index] ?? TenantInventoryItem(id: "", itemName: "", category: "", roomLocation: "", quantity: 1, condition: "", notes: "")
        } set: { newValue in
            guard var inventory = viewModel.inventory else { return }
            guard inventory.items.indices.contains(index) else { return }
            inventory.items[index] = newValue
            viewModel.inventory = inventory
        }
    }
}

private struct InventoryItemEditor: View {
    @Binding var item: TenantInventoryItem
    let editable: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            TextField("Item Name", text: $item.itemName)
                .disabled(!editable)
            TextField("Category", text: $item.category)
                .disabled(!editable)
            TextField("Room / Location", text: $item.roomLocation)
                .disabled(!editable)
            Stepper("quantity: \(item.quantity)", value: $item.quantity, in: 1...999)
                .disabled(!editable)
            TextField("Condition", text: $item.condition)
                .disabled(!editable)
            TextField("Notes", text: $item.notes, axis: .vertical)
                .disabled(!editable)
        }
        .font(.subheadline)
    }
}
