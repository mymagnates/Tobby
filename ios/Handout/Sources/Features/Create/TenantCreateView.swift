import SwiftUI

struct TenantCreateView: View {
    var body: some View {
        List {
            Section("Create Entry") {
                NavigationLink {
                    CreateTaskView()
                } label: {
                    Label("Create Task", systemImage: "checklist")
                }
            }

            Section("Reserved") {
                Label("Voice Fill Agent (MVP placeholder)", systemImage: "waveform")
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Create")
    }
}
