import PhotosUI
import SwiftUI

@MainActor
final class CreateTaskViewModel: ObservableObject {
    @Published var taskTitle: String = ""
    @Published var taskDescription: String = ""
    @Published var taskCategory: String = ""
    @Published var taskPriority: TaskPriority = .medium
    @Published var propertyID: String = ""
    @Published var unitID: String = ""
    @Published var selectedPhotos: [PhotosPickerItem] = []
    @Published private(set) var preparedPhotoCount: Int = 0
    @Published var uploadProgress: Double = 0
    @Published var isSaving: Bool = false
    @Published var message: String?
    @Published var messageIsError: Bool = false

    private let service: TenantTaskServiceProtocol

    init(service: TenantTaskServiceProtocol = TenantTaskService()) {
        self.service = service
    }

    var canSubmit: Bool {
        !taskTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !taskDescription.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        selectedPhotos.count <= 6
    }

    func saveDraft() async {
        await runAction(isSubmit: false)
    }

    func submitTask() async {
        await runAction(isSubmit: true)
    }

    private func runAction(isSubmit: Bool) async {
        isSaving = true
        defer { isSaving = false }

        do {
            let photoPayloads = try await preparePhotoPayloads()
            preparedPhotoCount = photoPayloads.count

            let draft = TenantTaskDraft(
                taskTitle: taskTitle,
                taskDescription: taskDescription,
                taskCategory: taskCategory,
                taskPriority: taskPriority,
                propertyID: propertyID,
                unitID: unitID,
                photoCount: photoPayloads.count
            )

            if isSubmit {
                try await service.submitTask(draft, photos: photoPayloads) { [weak self] progress in
                    Task { @MainActor in
                        self?.uploadProgress = progress
                    }
                }
                message = "Submit Task completed."
            } else {
                try await service.saveDraft(draft, photos: photoPayloads) { [weak self] progress in
                    Task { @MainActor in
                        self?.uploadProgress = progress
                    }
                }
                message = "Save Draft completed."
            }
            uploadProgress = 1
            messageIsError = false
        } catch {
            message = error.localizedDescription
            messageIsError = true
        }
    }

    private func preparePhotoPayloads() async throws -> [Data] {
        if selectedPhotos.count > 6 {
            throw TenantTaskError.validationFailed("photos[] max is 6 per task.")
        }

        var results: [Data] = []
        for item in selectedPhotos {
            guard let raw = try await item.loadTransferable(type: Data.self) else {
                throw TenantTaskError.validationFailed("Failed to load one of selected photos.")
            }
            let compressed = try ImageCompressionService.compressToMVPSize(raw)
            results.append(compressed)
        }
        return results
    }
}

struct CreateTaskView: View {
    @StateObject private var viewModel = CreateTaskViewModel()

    var body: some View {
        Form {
            Section("Task Fields") {
                TextField("Task Title (required)", text: $viewModel.taskTitle)
                TextField("Task Description (required)", text: $viewModel.taskDescription, axis: .vertical)
                TextField("Task Category (optional)", text: $viewModel.taskCategory)

                Picker("Task Priority", selection: $viewModel.taskPriority) {
                    ForEach(TaskPriority.allCases) { priority in
                        Text(priority.displayName).tag(priority)
                    }
                }

                TextField("Property ID (tenant scope)", text: $viewModel.propertyID)
                TextField("Unit ID (optional)", text: $viewModel.unitID)
            }

            Section("photos[]") {
                PhotosPicker(
                    selection: $viewModel.selectedPhotos,
                    maxSelectionCount: 6,
                    matching: .images
                ) {
                    Label("Select Images", systemImage: "photo.on.rectangle")
                }
                Text("MVP policy: image only, max 6 per task, each image <= 1 MB after compression.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Text("Selected: \(viewModel.selectedPhotos.count)/6")
                    .font(.footnote)
                if viewModel.preparedPhotoCount > 0 {
                    Text("Ready to upload: \(viewModel.preparedPhotoCount)")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                if viewModel.isSaving && viewModel.preparedPhotoCount > 0 {
                    ProgressView(value: viewModel.uploadProgress, total: 1.0)
                }
            }

            Section("Actions") {
                Button("Save Draft") {
                    Task { await viewModel.saveDraft() }
                }
                .disabled(viewModel.isSaving || viewModel.selectedPhotos.count > 6)

                Button("Submit Task") {
                    Task { await viewModel.submitTask() }
                }
                .disabled(viewModel.isSaving || !viewModel.canSubmit)
            }

            if let message = viewModel.message {
                Section {
                    Text(message)
                        .foregroundStyle(viewModel.messageIsError ? .red : .green)
                        .font(.footnote)
                }
            }
        }
        .navigationTitle("Create Task")
    }
}
