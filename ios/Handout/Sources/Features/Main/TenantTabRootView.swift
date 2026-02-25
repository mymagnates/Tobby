import SwiftUI
#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

struct RoleBasedRootView: View {
    @EnvironmentObject private var session: SessionManager

    var body: some View {
        switch session.roleScope {
        case .tenant:
            TenantTabRootView()
        case .pmPo:
            PMPOTabRootView()
        case .sp:
            SPTabRootView()
        case .unknown:
            NavigationStack {
                List {
                    Section("Account") {
                        Text("Current role: \(session.roleCode)")
                        Text("No page scope is mapped for this role yet.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
                .navigationTitle("Role Not Supported")
            }
        }
    }
}

struct TenantTabRootView: View {
    var body: some View {
        TabView {
            NavigationStack {
                TenantDashboardView()
            }
            .tabItem {
                Label("Dashboard", systemImage: "house")
            }

            NavigationStack {
                TenantCreateView()
            }
            .tabItem {
                Label("Create", systemImage: "plus.square")
            }

            NavigationStack {
                TenantInboxView()
            }
            .tabItem {
                Label("Inbox", systemImage: "tray")
            }

            NavigationStack {
                TenantRecordsView()
            }
            .tabItem {
                Label("Records", systemImage: "clock.arrow.circlepath")
            }

            NavigationStack {
                TenantProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person")
            }
        }
    }
}

struct PMPOTabRootView: View {
    var body: some View {
        TabView {
            NavigationStack {
                PMDashboardView()
            }
            .tabItem {
                Label("Dashboard", systemImage: "building.2")
            }

            NavigationStack {
                PMCreateView()
            }
            .tabItem {
                Label("Create", systemImage: "plus.square.on.square")
            }

            NavigationStack {
                TenantInboxView()
            }
            .tabItem {
                Label("Inbox", systemImage: "tray.full")
            }

            NavigationStack {
                PMRecordsView()
            }
            .tabItem {
                Label("Records", systemImage: "doc.text.magnifyingglass")
            }

            NavigationStack {
                PMReportsView()
            }
            .tabItem {
                Label("Reports", systemImage: "chart.bar")
            }

            NavigationStack {
                PMProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.crop.circle")
            }
        }
    }
}

struct SPTabRootView: View {
    var body: some View {
        TabView {
            NavigationStack {
                SPDashboardView()
            }
            .tabItem {
                Label("Dashboard", systemImage: "wrench.and.screwdriver")
            }

            NavigationStack {
                TenantInboxView()
            }
            .tabItem {
                Label("Inbox", systemImage: "tray")
            }

            NavigationStack {
                SPRecordsView()
            }
            .tabItem {
                Label("Records", systemImage: "list.clipboard")
            }

            NavigationStack {
                SPProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person")
            }
        }
    }
}

@MainActor
private final class PMDashboardViewModel: ObservableObject {
    struct Snapshot {
        var openTasksCount: Int = 0
        var inProgressTasksCount: Int = 0
        var resolvedTasksCount: Int = 0
        var overdueTasksCount: Int = 0
        var todayRemindersCount: Int = 0
        var activeRemindersCount: Int = 0
        var expiringLeasesCount: Int = 0
        var overdueRentCount: Int = 0
        var rentDueCount: Int = 0
        var rentPaidCount: Int = 0
        var monthlyIncome: Double = 0
        var monthlyExpense: Double = 0
        var occupancyRate: Double = 0
        var occupiedPropertyCount: Int = 0
        var vacantPropertyCount: Int = 0
    }

    @Published var snapshot = Snapshot()
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let userFieldCandidates = ["pm_id", "po_id", "owner_id", "manager_id", "created_by", "create_id", "user_id"]

    func load(userID: String) async {
        guard !userID.isEmpty else { return }
        isLoading = true
        defer { isLoading = false }

        #if canImport(FirebaseFirestore)
        do {
            let taskDocs = try await FirestoreQueryHelper.collectionGroupDocs(
                collectionID: FirestoreSchema.Collections.mxrecords,
                userID: userID,
                userFieldCandidates: userFieldCandidates,
                limit: 300
            )
            let leaseDocs = try await FirestoreQueryHelper.collectionDocs(
                collectionID: FirestoreSchema.Collections.leases,
                userID: userID,
                userFieldCandidates: userFieldCandidates,
                limit: 300
            )
            let transactionDocs = (try? await FirestoreQueryHelper.collectionGroupDocs(
                collectionID: FirestoreSchema.Collections.transactions,
                userID: userID,
                userFieldCandidates: userFieldCandidates,
                limit: 300
            )) ?? []
            let reminderDocs = (try? await FirestoreQueryHelper.collectionGroupDocs(
                collectionID: FirestoreSchema.Collections.reminders,
                userID: userID,
                userFieldCandidates: userFieldCandidates,
                limit: 300
            )) ?? []
            let propertyDocs = (try? await FirestoreQueryHelper.collectionDocs(
                collectionID: FirestoreSchema.Collections.properties,
                userID: userID,
                userFieldCandidates: userFieldCandidates,
                limit: 300
            )) ?? []

            let now = Date()
            let overdueStatuses = ["overdue", "late", "past_due", "past due"]
            let openStatuses = ["open", "new", "pending"]
            let inProgressStatuses = ["in_progress", "in progress", "working"]
            let resolvedStatuses = ["resolved", "done", "completed", "closed"]
            let occupiedStatuses = ["occupied", "active", "rented"]
            let vacantStatuses = ["vacant", "available", "inactive", "ended", "closed"]

            var next = Snapshot()
            let calendar = Calendar.current
            let today = calendar.startOfDay(for: now)
            let monthRange = calendar.dateInterval(of: .month, for: now)

            for doc in taskDocs {
                let data = doc.data()
                let status = (FirestoreValueDecoder.string(data[FirestoreSchema.CommonFields.status]) ?? "").lowercased()
                let reportDate = FirestoreValueDecoder.date(data["report_date"]) ?? FirestoreValueDecoder.date(data["createAt"])
                let isResolved = resolvedStatuses.contains(status)
                    || FirestoreValueDecoder.date(data["resolv_date"]) != nil
                    || !(FirestoreValueDecoder.string(data["resolution"]) ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty

                if isResolved {
                    next.resolvedTasksCount += 1
                } else if inProgressStatuses.contains(status) {
                    next.inProgressTasksCount += 1
                } else if openStatuses.contains(status) || status.isEmpty {
                    next.openTasksCount += 1
                }

                if !isResolved, let reportDate, reportDate < today {
                    next.overdueTasksCount += 1
                } else if overdueStatuses.contains(status) {
                    next.overdueTasksCount += 1
                }
            }

            for doc in leaseDocs {
                let data = doc.data()
                let leaseTermMonths = FirestoreValueDecoder.int(data["lease_term"])
                let startDate = FirestoreValueDecoder.date(data["start_date"])
                    ?? FirestoreValueDecoder.date(data["lease_create_date"])
                    ?? FirestoreValueDecoder.date(data["created_at"])
                    ?? FirestoreValueDecoder.date(data["created_datetime"])
                let endDate = FirestoreValueDecoder.date(data[FirestoreSchema.LeaseFields.endDate])
                    ?? {
                        guard let startDate, let leaseTermMonths else { return nil }
                        return calendar.date(byAdding: .month, value: leaseTermMonths, to: startDate)
                    }()
                if let endDate,
                   let days = calendar.dateComponents([.day], from: now, to: endDate).day,
                   days >= 0,
                   days <= 30 {
                    next.expiringLeasesCount += 1
                }

                let dueDate = FirestoreValueDecoder.date(data[FirestoreSchema.LeaseFields.dueDate])
                let leaseStatus = (FirestoreValueDecoder.string(data[FirestoreSchema.CommonFields.status]) ?? "").lowercased()
                if let dueDate, dueDate < now, !["paid", "closed"].contains(leaseStatus) {
                    next.overdueRentCount += 1
                }
            }

            if propertyDocs.isEmpty {
                for doc in leaseDocs {
                    let status = (FirestoreValueDecoder.string(doc.data()[FirestoreSchema.CommonFields.status]) ?? "").lowercased()
                    if occupiedStatuses.contains(status) {
                        next.occupiedPropertyCount += 1
                    } else if vacantStatuses.contains(status) {
                        next.vacantPropertyCount += 1
                    }
                }
            } else {
                for doc in propertyDocs {
                    let status = (FirestoreValueDecoder.string(doc.data()[FirestoreSchema.CommonFields.status]) ?? "").lowercased()
                    if occupiedStatuses.contains(status) {
                        next.occupiedPropertyCount += 1
                    } else if vacantStatuses.contains(status) {
                        next.vacantPropertyCount += 1
                    }
                }
            }

            let totalProperties = next.occupiedPropertyCount + next.vacantPropertyCount
            next.occupancyRate = totalProperties > 0 ? Double(next.occupiedPropertyCount) / Double(totalProperties) : 0

            for doc in transactionDocs {
                let data = doc.data()
                let date = FirestoreValueDecoder.date(data["transac_date"])
                    ?? FirestoreValueDecoder.date(data["created_datetime"])
                    ?? FirestoreValueDecoder.date(data[FirestoreSchema.TransactionFields.dateCandidates[0]])
                    ?? FirestoreValueDecoder.date(data[FirestoreSchema.TransactionFields.dateCandidates[1]])
                guard let date, let monthRange, monthRange.contains(date) else { continue }
                let amount = FirestoreValueDecoder.double(data[FirestoreSchema.TransactionFields.amount]) ?? 0
                let type = (FirestoreValueDecoder.string(data["transac_type"])
                    ?? FirestoreValueDecoder.string(data[FirestoreSchema.TransactionFields.typeCandidates[0]])
                    ?? FirestoreValueDecoder.string(data[FirestoreSchema.TransactionFields.typeCandidates[1]])
                    ?? "").lowercased()
                if isIncomeTransaction(type: type) {
                    next.monthlyIncome += amount
                    if type.contains("rent") {
                        next.rentPaidCount += 1
                    }
                } else {
                    next.monthlyExpense += amount
                }
            }

            for doc in reminderDocs {
                let data = doc.data()
                let startDate = FirestoreValueDecoder.date(data["start_date"])
                    ?? FirestoreValueDecoder.date(data["created_date"])
                let isActive = FirestoreValueDecoder.bool(data["status"]) ?? true
                let category = (FirestoreValueDecoder.string(data["category"]) ?? "").lowercased()
                if isActive {
                    next.activeRemindersCount += 1
                }
                if let startDate, calendar.isDate(startDate, inSameDayAs: now) {
                    next.todayRemindersCount += 1
                }
                if isActive,
                   category.contains("rent") || category.contains("fee"),
                   let startDate,
                   startDate < today {
                    next.rentDueCount += 1
                }
            }

            next.overdueRentCount = max(next.overdueRentCount, next.rentDueCount - next.rentPaidCount)
            snapshot = next
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
        #else
        snapshot = Snapshot(
            openTasksCount: 6,
            inProgressTasksCount: 2,
            resolvedTasksCount: 3,
            overdueTasksCount: 1,
            todayRemindersCount: 2,
            activeRemindersCount: 4,
            expiringLeasesCount: 1,
            overdueRentCount: 1,
            rentDueCount: 2,
            rentPaidCount: 1,
            monthlyIncome: 5400,
            monthlyExpense: 2600,
            occupancyRate: 0.8,
            occupiedPropertyCount: 8,
            vacantPropertyCount: 2
        )
        #endif
    }

    private func isIncomeTransaction(type: String) -> Bool {
        if type.contains("rent") || type.contains("income") || type.contains("payment") || type.contains("receipt") {
            return true
        }
        let expenseKeywords = ["fee", "tax", "bill", "maintenance", "repair", "hoa", "utility", "insurance", "expense"]
        return !expenseKeywords.contains(where: { type.contains($0) })
    }
}

struct PMDashboardView: View {
    @EnvironmentObject private var session: SessionManager
    @StateObject private var viewModel = PMDashboardViewModel()

    var body: some View {
        List {
            if let error = viewModel.errorMessage {
                Section {
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(.orange)
                }
            }

            Section("Tasks & Alerts") {
                MetricRow(title: "Open Tasks", value: "\(viewModel.snapshot.openTasksCount)")
                MetricRow(title: "Overdue Tasks", value: "\(viewModel.snapshot.overdueTasksCount)")
                MetricRow(title: "Today Reminders", value: "\(viewModel.snapshot.todayRemindersCount)")
            }

            Section("Lease & Rent") {
                MetricRow(title: "Expiring Leases", value: "\(viewModel.snapshot.expiringLeasesCount)")
                MetricRow(title: "Overdue Rent", value: "\(viewModel.snapshot.overdueRentCount)")
                MetricRow(title: "Occupancy", value: "\(Int(viewModel.snapshot.occupancyRate * 100))%")
            }

            Section("Finance") {
                MetricRow(title: "Monthly Income", value: viewModel.snapshot.monthlyIncome.formatted(.currency(code: "USD")))
                MetricRow(title: "Monthly Expense", value: viewModel.snapshot.monthlyExpense.formatted(.currency(code: "USD")))
            }
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView("Loading dashboard...")
            }
        }
        .navigationTitle("Dashboard")
        .task(id: session.userID) {
            await viewModel.load(userID: session.userID)
        }
    }
}

private struct MetricRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
        }
        .font(.subheadline)
    }
}

struct PMCreateView: View {
    @EnvironmentObject private var session: SessionManager
    @State private var entityType = PMEntityType.task.rawValue
    @State private var propertyID = ""
    @State private var title = ""
    @State private var description = ""
    @State private var attachmentsCSV = ""

    @State private var taskID = ""
    @State private var taskPriority = "medium"
    @State private var taskStatus = "open"
    @State private var assignedSPID = ""
    @State private var taskDueDate = Date()

    @State private var propertyName = ""
    @State private var propertyAddress = ""
    @State private var propertyType = ""
    @State private var propertyStatus = "active"

    @State private var assetID = ""
    @State private var assetName = ""
    @State private var assetCategory = ""
    @State private var assetLocation = ""
    @State private var assetCondition = ""

    @State private var reminderID = ""
    @State private var reminderTitle = ""
    @State private var reminderDate = Date()
    @State private var repeatRule = ""

    @State private var leaseID = ""
    @State private var tenantID = ""
    @State private var leaseStartDate = Date()
    @State private var leaseEndDate = Date()
    @State private var leaseRentAmount = ""
    @State private var leaseDueDate = Date()

    @State private var documentID = ""
    @State private var documentType = ""
    @State private var fileURL = ""
    @State private var relatedEntityType = ""
    @State private var relatedEntityID = ""

    @State private var transactionID = ""
    @State private var transactionType = "expense"
    @State private var transactionAmount = ""
    @State private var transactionDate = Date()
    @State private var transactionMethod = ""
    @State private var transactionNotes = ""

    @State private var inventoryListID = ""
    @State private var inventoryType = "move_out"
    @State private var inventoryStatus = "draft"
    @State private var inventoryItemsText = ""

    @State private var isSubmitting = false
    @State private var statusMessage: String?

    private var selectedEntityType: PMEntityType {
        PMEntityType(rawValue: entityType) ?? .task
    }

    private var canSubmit: Bool {
        switch selectedEntityType {
        case .task:
            return !title.isEmpty && !description.isEmpty
        case .property:
            return !propertyID.isEmpty && !propertyName.isEmpty
        case .asset:
            return !assetID.isEmpty && !assetName.isEmpty
        case .reminder:
            return !reminderID.isEmpty && !reminderTitle.isEmpty
        case .lease:
            return !leaseID.isEmpty && !tenantID.isEmpty && !leaseRentAmount.isEmpty
        case .document:
            return !documentID.isEmpty && !documentType.isEmpty && !fileURL.isEmpty
        case .transaction:
            return !transactionID.isEmpty && !transactionAmount.isEmpty
        case .inventory:
            return !inventoryListID.isEmpty
        }
    }

    var body: some View {
        Form {
            Section("Entity") {
                Picker("Entity Type", selection: $entityType) {
                    ForEach(PMEntityType.allCases) { value in
                        Text(value.rawValue.humanizedFieldName).tag(value.rawValue)
                    }
                }
                .pickerStyle(.menu)
            }

            Section("Common") {
                TextField("property_id", text: $propertyID)
                TextField("Title", text: $title)
                TextField("Description", text: $description, axis: .vertical)
                TextField("attachments[] (comma separated URLs)", text: $attachmentsCSV)
            }

            switch selectedEntityType {
            case .task:
                Section("Task") {
                    TextField("task_id", text: $taskID)
                    TextField("priority", text: $taskPriority)
                    TextField("status", text: $taskStatus)
                    TextField("assigned_sp_id", text: $assignedSPID)
                    DatePicker("due_date", selection: $taskDueDate, displayedComponents: .date)
                }
            case .property:
                Section("Property") {
                    TextField("property_id", text: $propertyID)
                    TextField("name", text: $propertyName)
                    TextField("address", text: $propertyAddress)
                    TextField("type", text: $propertyType)
                    TextField("status", text: $propertyStatus)
                }
            case .asset:
                Section("Asset") {
                    TextField("asset_id", text: $assetID)
                    TextField("asset_name", text: $assetName)
                    TextField("category", text: $assetCategory)
                    TextField("location", text: $assetLocation)
                    TextField("condition", text: $assetCondition)
                }
            case .reminder:
                Section("Reminder") {
                    TextField("reminder_id", text: $reminderID)
                    TextField("reminder_title", text: $reminderTitle)
                    DatePicker("reminder_date", selection: $reminderDate, displayedComponents: .date)
                    TextField("repeat_rule", text: $repeatRule)
                }
            case .lease:
                Section("Lease") {
                    TextField("lease_id", text: $leaseID)
                    TextField("tenant_id", text: $tenantID)
                    DatePicker("start_date", selection: $leaseStartDate, displayedComponents: .date)
                    DatePicker("end_date", selection: $leaseEndDate, displayedComponents: .date)
                    TextField("rent_amount", text: $leaseRentAmount)
                        .keyboardType(.decimalPad)
                    DatePicker("due_date", selection: $leaseDueDate, displayedComponents: .date)
                }
            case .document:
                Section("Document") {
                    TextField("document_id", text: $documentID)
                    TextField("document_type", text: $documentType)
                    TextField("file_url", text: $fileURL)
                    TextField("related_entity_type", text: $relatedEntityType)
                    TextField("related_entity_id", text: $relatedEntityID)
                }
            case .transaction:
                Section("Transaction") {
                    TextField("transaction_id", text: $transactionID)
                    Picker("transaction_type", selection: $transactionType) {
                        Text("income").tag("income")
                        Text("expense").tag("expense")
                        Text("payment").tag("payment")
                        Text("receipt").tag("receipt")
                    }
                    .pickerStyle(.segmented)
                    TextField("amount", text: $transactionAmount)
                        .keyboardType(.decimalPad)
                    DatePicker("date", selection: $transactionDate, displayedComponents: .date)
                    TextField("method", text: $transactionMethod)
                    TextField("notes", text: $transactionNotes, axis: .vertical)
                }
            case .inventory:
                Section("Inventory") {
                    TextField("inventory_list_id", text: $inventoryListID)
                    Picker("inventory_type", selection: $inventoryType) {
                        Text("move_in").tag("move_in")
                        Text("move_out").tag("move_out")
                    }
                    .pickerStyle(.segmented)
                    Picker("status", selection: $inventoryStatus) {
                        Text("draft").tag("draft")
                        Text("submitted").tag("submitted")
                    }
                    .pickerStyle(.segmented)
                    TextField("items[] (one per line)", text: $inventoryItemsText, axis: .vertical)
                }
            }

            Section("Actions") {
                Button("Save Draft") {
                    Task { await submit(isDraft: true) }
                }
                .disabled(isSubmitting || !canSubmit)

                Button("Submit") {
                    Task { await submit(isDraft: false) }
                }
                .disabled(isSubmitting || !canSubmit)
            }

            if let statusMessage {
                Section {
                    Text(statusMessage)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationTitle("Create")
    }

    private func submit(isDraft: Bool) async {
        guard !session.userID.isEmpty else {
            statusMessage = "Missing session user ID."
            return
        }
        isSubmitting = true
        defer { isSubmitting = false }

        #if canImport(FirebaseFirestore)
        do {
            let payload: [String: Any]
            let collectionPath: String
            switch selectedEntityType {
            case .task:
                guard !propertyID.isEmpty else {
                    statusMessage = "property_id is required for task."
                    return
                }
                payload = buildTaskPayload(isDraft: isDraft)
                collectionPath = "properties/\(propertyID)/mxrecords"
            case .property:
                payload = buildPropertyPayload(isDraft: isDraft)
                collectionPath = "properties"
            case .asset:
                guard !propertyID.isEmpty else {
                    statusMessage = "property_id is required for asset."
                    return
                }
                payload = buildAssetPayload(isDraft: isDraft)
                collectionPath = "properties/\(propertyID)/assets"
            case .reminder:
                guard !propertyID.isEmpty else {
                    statusMessage = "property_id is required for reminder."
                    return
                }
                payload = buildReminderPayload(isDraft: isDraft)
                collectionPath = "properties/\(propertyID)/reminders"
            case .lease:
                payload = buildLeasePayload(isDraft: isDraft)
                collectionPath = "leases"
            case .document:
                guard !propertyID.isEmpty else {
                    statusMessage = "property_id is required for document."
                    return
                }
                payload = buildDocumentPayload(isDraft: isDraft)
                collectionPath = "properties/\(propertyID)/property_photos"
            case .transaction:
                guard !propertyID.isEmpty else {
                    statusMessage = "property_id is required for transaction."
                    return
                }
                payload = buildTransactionPayload(isDraft: isDraft)
                collectionPath = "properties/\(propertyID)/transactions"
            case .inventory:
                guard !propertyID.isEmpty else {
                    statusMessage = "property_id is required for inventory."
                    return
                }
                payload = buildInventoryPayload(isDraft: isDraft)
                collectionPath = "properties/\(propertyID)/inventories"
            }

            _ = try await Firestore.firestore().collection(collectionPath).addDocument(data: payload)
            statusMessage = isDraft ? "Draft saved." : "Submitted successfully."
            if !isDraft {
                resetForm()
            }
        } catch {
            statusMessage = error.localizedDescription
        }
        #else
        statusMessage = isDraft ? "Draft saved (local mode)." : "Submitted (local mode)."
        #endif
    }

    private func baseCreatePayload() -> [String: Any] {
        let now = Date()
        var payload: [String: Any] = [
            "property_id": propertyID,
            "title": title,
            "description": description,
            "created_by": session.userID,
            "created_by_role": session.roleCode,
            "updated_at": now,
            "created_at": now,
            "entity_type": selectedEntityType.rawValue
        ]
        let attachments = parseCommaSeparated(attachmentsCSV)
        if !attachments.isEmpty {
            payload["attachments"] = attachments
        }
        return payload
    }

    private func buildTaskPayload(isDraft: Bool) -> [String: Any] {
        let now = Date()
        var payload = baseCreatePayload()
        payload["mx_id"] = taskID.isEmpty ? "mx_\(Int(now.timeIntervalSince1970))" : taskID
        payload["report_date"] = isoDate(taskDueDate)
        payload["description"] = description
        payload["status"] = isDraft ? "draft" : taskStatus
        payload["create_id"] = session.userID
        payload["createAt"] = now
        payload["reported_by"] = session.userEmail
        payload["reported_role"] = session.roleCode
        payload["updatedAt"] = now
        payload["task_priority"] = taskPriority
        if !assignedSPID.isEmpty {
            payload["assigned_sp_id"] = assignedSPID
        }
        payload["logs"] = [[
            "log_timestamp": now,
            "comment": isDraft ? "Draft created" : "Initial report submitted",
            "user_id": session.userID,
            "user_name": session.userEmail,
            "user_role": session.roleCode
        ]]
        return payload
    }

    private func buildPropertyPayload(isDraft: Bool) -> [String: Any] {
        var payload = baseCreatePayload()
        payload["nickname"] = propertyName
        payload["address"] = propertyAddress
        payload["type"] = propertyType
        payload["status"] = isDraft ? "Draft" : propertyStatus
        payload["equipments"] = []
        payload["spec"] = [:]
        payload["createdAt"] = Date()
        payload["updatedAt"] = Date()
        return payload
    }

    private func buildAssetPayload(isDraft: Bool) -> [String: Any] {
        var payload = baseCreatePayload()
        payload["asset_id"] = assetID
        payload["nickname"] = assetName
        payload["type"] = assetCategory
        payload["location"] = assetLocation
        payload["condition"] = assetCondition
        payload["status"] = isDraft ? "draft" : "active"
        payload["brand"] = ""
        payload["model"] = ""
        payload["serial"] = ""
        payload["mfg_date"] = ""
        payload["acquired_date"] = ""
        payload["notes"] = description
        payload["images"] = []
        payload["created_at"] = isoDateTime(Date())
        payload["updated_at"] = isoDateTime(Date())
        return payload
    }

    private func buildReminderPayload(isDraft: Bool) -> [String: Any] {
        var payload = baseCreatePayload()
        payload["reminder_id"] = reminderID
        payload["category"] = reminderTitle
        payload["start_date"] = isoDate(reminderDate)
        payload["repeat_by"] = repeatRule.isEmpty ? "one-time" : repeatRule
        payload["amount"] = nil
        payload["note"] = description
        payload["status"] = !isDraft
        payload["created_date"] = isoDateTime(Date())
        return payload
    }

    private func buildLeasePayload(isDraft: Bool) -> [String: Any] {
        var payload = baseCreatePayload()
        payload["lease_id"] = leaseID
        payload["tenant_id"] = tenantID
        payload["status"] = isDraft ? "Draft" : "Active"
        payload["lease_term"] = monthsBetween(leaseStartDate, leaseEndDate)
        payload["lease_create_date"] = isoDate(Date())
        payload["rate_type"] = "monthly"
        payload["rate_amount"] = Double(leaseRentAmount) ?? 0
        payload["deposit"] = 0
        payload["pet_fee"] = 0
        payload["application_fee_per_person"] = 0
        payload["utilities_included"] = []
        payload["furnished"] = ""
        payload["special_terms"] = description
        payload["additional_notes"] = ""
        payload["property_string_id"] = propertyID
        payload["LSID"] = leaseID.isEmpty ? "lease_\(Int(Date().timeIntervalSince1970))" : leaseID
        payload["created_at"] = isoDateTime(Date())
        payload["created_datetime"] = Date()
        return payload
    }

    private func buildDocumentPayload(isDraft: Bool) -> [String: Any] {
        var payload = baseCreatePayload()
        payload["document_id"] = documentID
        payload["document_type"] = documentType
        payload["file_url"] = fileURL
        payload["image_url"] = fileURL
        payload["original_filename"] = documentID.isEmpty ? "document" : documentID
        payload["storage_path"] = ""
        payload["source_type"] = relatedEntityType.isEmpty ? "property" : relatedEntityType
        payload["source_id"] = relatedEntityID
        payload["source_label"] = title
        payload["status"] = isDraft ? "draft" : "submitted"
        payload["upload_date"] = isoDateTime(Date())
        payload["created_datetime"] = isoDateTime(Date())
        return payload
    }

    private func buildTransactionPayload(isDraft: Bool) -> [String: Any] {
        var payload = baseCreatePayload()
        let now = Date()
        payload["transac_id"] = transactionID.isEmpty ? "txn_\(Int(now.timeIntervalSince1970))" : transactionID
        payload["role"] = session.roleCode
        payload["transac_from"] = session.roleCode
        payload["transac_to"] = transactionType == "income" ? "Property Owner" : "Service Provider"
        payload["amount"] = Double(transactionAmount) ?? 0
        payload["transac_date"] = isoDate(transactionDate)
        payload["transac_type"] = transactionType
        payload["note"] = transactionNotes
        payload["picture_url"] = ""
        payload["created_by"] = session.userID
        payload["created_datetime"] = isoDateTime(now)
        payload["status"] = isDraft ? "draft" : "submitted"
        return payload
    }

    private func buildInventoryPayload(isDraft: Bool) -> [String: Any] {
        var payload = baseCreatePayload()
        payload["inventory_list_id"] = inventoryListID
        payload["inventory_type"] = inventoryType
        payload["status"] = isDraft ? "draft" : inventoryStatus
        payload["items"] = parseLines(inventoryItemsText)
        payload["lease_id"] = leaseID
        payload["property_address"] = propertyAddress
        payload["created_datetime"] = isoDateTime(Date())
        payload["updated_datetime"] = isoDateTime(Date())
        return payload
    }

    private func parseCommaSeparated(_ input: String) -> [String] {
        input
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }

    private func parseLines(_ input: String) -> [String] {
        input
            .split(whereSeparator: \.isNewline)
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }

    private func isoDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    private func isoDateTime(_ date: Date) -> String {
        ISO8601DateFormatter().string(from: date)
    }

    private func monthsBetween(_ start: Date, _ end: Date) -> Int {
        max(Calendar.current.dateComponents([.month], from: start, to: end).month ?? 0, 0)
    }

    private func resetForm() {
        propertyID = ""
        title = ""
        description = ""
        attachmentsCSV = ""

        taskID = ""
        taskPriority = "medium"
        taskStatus = "open"
        assignedSPID = ""
        taskDueDate = Date()

        propertyName = ""
        propertyAddress = ""
        propertyType = ""
        propertyStatus = "active"

        assetID = ""
        assetName = ""
        assetCategory = ""
        assetLocation = ""
        assetCondition = ""

        reminderID = ""
        reminderTitle = ""
        reminderDate = Date()
        repeatRule = ""

        leaseID = ""
        tenantID = ""
        leaseStartDate = Date()
        leaseEndDate = Date()
        leaseRentAmount = ""
        leaseDueDate = Date()

        documentID = ""
        documentType = ""
        fileURL = ""
        relatedEntityType = ""
        relatedEntityID = ""

        transactionID = ""
        transactionType = "expense"
        transactionAmount = ""
        transactionDate = Date()
        transactionMethod = ""
        transactionNotes = ""

        inventoryListID = ""
        inventoryType = "move_out"
        inventoryStatus = "draft"
        inventoryItemsText = ""
    }
}

private enum PMEntityType: String, CaseIterable, Identifiable {
    case property
    case task
    case asset
    case reminder
    case lease
    case document
    case transaction
    case inventory

    var id: String { rawValue }
}

private struct PMRecordSummary: Identifiable {
    let id: String
    let entityType: String
    let entityID: String
    let title: String
    let status: String
    let propertyID: String
    let updatedAt: Date?
}

private struct ServiceProviderSummary: Identifiable {
    let id: String
    let name: String
    let serviceArea: String
    let serviceTypes: [String]
    let rating: Double
    let responseTime: String
    let priceBand: String
}

private struct SPCardSummary: Identifiable {
    let id: String
    let spID: String
    let spName: String
    let serviceTypes: [String]
    let serviceArea: String
    let rating: Double
    let responseTime: String
    let priceBand: String
    let ownerNote: String
    let tags: [String]
    let updatedAt: Date?
}

@MainActor
private final class PMRecordsViewModel: ObservableObject {
    @Published var records: [PMRecordSummary] = []
    @Published var serviceProviders: [ServiceProviderSummary] = []
    @Published var spCards: [SPCardSummary] = []
    @Published var isLoadingRecords = false
    @Published var isLoadingSP = false
    @Published var isLoadingSPCards = false
    @Published var errorMessage: String?

    private let userFieldCandidates = ["pm_id", "po_id", "owner_id", "manager_id", "created_by", "create_id", "user_id"]

    func loadRecords(
        userID: String,
        entityType: String,
        keyword: String,
        propertyFilter: String,
        statusFilter: String,
        actorFilter: String,
        dateFrom: Date?,
        dateTo: Date?
    ) async {
        guard !userID.isEmpty else { return }
        isLoadingRecords = true
        defer { isLoadingRecords = false }

        #if canImport(FirebaseFirestore)
        do {
            let docs: [QueryDocumentSnapshot]
            switch entityType {
            case "task":
                docs = try await FirestoreQueryHelper.collectionGroupDocs(
                    collectionID: FirestoreSchema.Collections.mxrecords,
                    userID: userID,
                    userFieldCandidates: userFieldCandidates,
                    limit: 200
                )
            case "lease":
                docs = try await FirestoreQueryHelper.collectionDocs(
                    collectionID: FirestoreSchema.Collections.leases,
                    userID: userID,
                    userFieldCandidates: userFieldCandidates,
                    limit: 200
                )
            case "transaction":
                docs = try await FirestoreQueryHelper.collectionGroupDocs(
                    collectionID: FirestoreSchema.Collections.transactions,
                    userID: userID,
                    userFieldCandidates: userFieldCandidates,
                    limit: 200
                )
            case "inventory":
                var merged: [String: QueryDocumentSnapshot] = [:]
                if let newDocs = try? await FirestoreQueryHelper.collectionGroupDocs(
                    collectionID: "inventories",
                    userID: userID,
                    userFieldCandidates: userFieldCandidates,
                    limit: 200
                ) {
                    for doc in newDocs { merged[doc.reference.path] = doc }
                }
                if let oldDocs = try? await FirestoreQueryHelper.collectionGroupDocs(
                    collectionID: FirestoreSchema.Collections.inventoryLists,
                    userID: userID,
                    userFieldCandidates: userFieldCandidates,
                    limit: 200
                ) {
                    for doc in oldDocs { merged[doc.reference.path] = doc }
                }
                if merged.isEmpty {
                    if let snapshot = try? await Firestore.firestore().collectionGroup("inventories").limit(to: 100).getDocuments() {
                        for doc in snapshot.documents { merged[doc.reference.path] = doc }
                    }
                }
                docs = Array(merged.values)
            case "property":
                docs = try await FirestoreQueryHelper.collectionDocs(
                    collectionID: "properties",
                    userID: userID,
                    userFieldCandidates: userFieldCandidates,
                    limit: 200
                )
            case "asset":
                docs = try await FirestoreQueryHelper.collectionGroupDocs(
                    collectionID: "assets",
                    userID: userID,
                    userFieldCandidates: userFieldCandidates,
                    limit: 200
                )
            case "reminder":
                docs = try await FirestoreQueryHelper.collectionGroupDocs(
                    collectionID: "reminders",
                    userID: userID,
                    userFieldCandidates: userFieldCandidates,
                    limit: 200
                )
            case "document":
                var merged: [String: QueryDocumentSnapshot] = [:]
                let documentCollections = ["property_photos", "documents", "lease_docs"]
                for collection in documentCollections {
                    if let groupDocs = try? await FirestoreQueryHelper.collectionGroupDocs(
                        collectionID: collection,
                        userID: userID,
                        userFieldCandidates: userFieldCandidates,
                        limit: 200
                    ) {
                        for doc in groupDocs { merged[doc.reference.path] = doc }
                    }
                }
                if merged.isEmpty {
                    for collection in documentCollections {
                        if let snapshot = try? await Firestore.firestore().collectionGroup(collection).limit(to: 100).getDocuments() {
                            for doc in snapshot.documents { merged[doc.reference.path] = doc }
                        }
                    }
                }
                docs = Array(merged.values)
            default:
                docs = []
            }

            let normalizedKeyword = keyword.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            let normalizedProperty = propertyFilter.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            let normalizedStatus = statusFilter.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            let normalizedActor = actorFilter.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            records = docs.compactMap { doc in
                let data = doc.data()
                let propertyID = extractPropertyID(data: data)
                let (title, status, entityID, updatedAt) = decodeRecordPresentation(
                    entityType: entityType,
                    data: data,
                    fallbackID: doc.documentID
                )

                if !normalizedKeyword.isEmpty {
                    let haystack = "\(title) \(status) \(entityID)".lowercased()
                    if !haystack.contains(normalizedKeyword) {
                        return nil
                    }
                }
                if !normalizedProperty.isEmpty && !propertyID.lowercased().contains(normalizedProperty) {
                    return nil
                }
                if !normalizedStatus.isEmpty && !status.lowercased().contains(normalizedStatus) {
                    return nil
                }
                if !normalizedActor.isEmpty {
                    let actor = (
                        FirestoreValueDecoder.string(data["created_by"])
                        ?? FirestoreValueDecoder.string(data["create_id"])
                        ?? FirestoreValueDecoder.string(data["owner_id"])
                        ?? ""
                    ).lowercased()
                    if !actor.contains(normalizedActor) {
                        return nil
                    }
                }
                if let dateFrom, let updatedAt, updatedAt < dateFrom {
                    return nil
                }
                if let dateTo, let updatedAt, updatedAt > dateTo {
                    return nil
                }
                return PMRecordSummary(
                    id: doc.reference.path,
                    entityType: entityType,
                    entityID: entityID,
                    title: title,
                    status: status,
                    propertyID: propertyID,
                    updatedAt: updatedAt
                )
            }
            errorMessage = nil
        } catch {
            records = []
            errorMessage = error.localizedDescription
        }
        #else
        records = [
            PMRecordSummary(id: "local-1", entityType: entityType, entityID: "local-1", title: "Sample \(entityType)", status: "open", propertyID: "P-001", updatedAt: Date())
        ]
        #endif
    }

    private func extractPropertyID(data: [String: Any]) -> String {
        if let raw = data["property_id"] as? String {
            return raw
        }
        if let raw = data["property_string_id"] as? String {
            return raw
        }
        if let object = data["property_id"] as? [String: Any] {
            return FirestoreValueDecoder.string(object["id"])
                ?? FirestoreValueDecoder.string(object["property_id"])
                ?? ""
        }
        return ""
    }

    private func decodeRecordPresentation(
        entityType: String,
        data: [String: Any],
        fallbackID: String
    ) -> (title: String, status: String, entityID: String, updatedAt: Date?) {
        switch entityType {
        case PMEntityType.task.rawValue:
            let entityID = FirestoreValueDecoder.string(data["mx_id"]) ?? fallbackID
            let title = FirestoreValueDecoder.string(data["description"])
                ?? FirestoreValueDecoder.string(data["title"])
                ?? "Task \(entityID)"
            let status = FirestoreValueDecoder.string(data["status"]) ?? "open"
            let updatedAt = FirestoreValueDecoder.date(data["updatedAt"])
                ?? FirestoreValueDecoder.date(data["updated_at"])
                ?? FirestoreValueDecoder.date(data["createAt"])
            return (title, status, entityID, updatedAt)
        case PMEntityType.transaction.rawValue:
            let entityID = FirestoreValueDecoder.string(data["transac_id"]) ?? fallbackID
            let type = FirestoreValueDecoder.string(data["transac_type"]) ?? "transaction"
            let amount = FirestoreValueDecoder.double(data["amount"]) ?? 0
            let title = "\(type.humanizedFieldName) \(amount.formatted(.currency(code: "USD")))"
            let status = FirestoreValueDecoder.string(data["status"]) ?? "posted"
            let updatedAt = FirestoreValueDecoder.date(data["created_datetime"])
                ?? FirestoreValueDecoder.date(data["updated_at"])
            return (title, status, entityID, updatedAt)
        case PMEntityType.lease.rawValue:
            let entityID = FirestoreValueDecoder.string(data["LSID"])
                ?? FirestoreValueDecoder.string(data["lease_id"])
                ?? fallbackID
            let title = FirestoreValueDecoder.string(data["title"])
                ?? FirestoreValueDecoder.string(data["property_nickname"])
                ?? "Lease \(entityID)"
            let status = FirestoreValueDecoder.string(data["status"]) ?? "N/A"
            let updatedAt = FirestoreValueDecoder.date(data["updated_at"])
                ?? FirestoreValueDecoder.date(data["created_datetime"])
            return (title, status, entityID, updatedAt)
        case PMEntityType.property.rawValue:
            let entityID = fallbackID
            let title = FirestoreValueDecoder.string(data["nickname"])
                ?? FirestoreValueDecoder.string(data["title"])
                ?? "Property \(entityID)"
            let status = FirestoreValueDecoder.string(data["status"]) ?? "N/A"
            let updatedAt = FirestoreValueDecoder.date(data["updatedAt"])
                ?? FirestoreValueDecoder.date(data["updated_at"])
            return (title, status, entityID, updatedAt)
        case PMEntityType.asset.rawValue:
            let entityID = FirestoreValueDecoder.string(data["asset_id"]) ?? fallbackID
            let title = FirestoreValueDecoder.string(data["nickname"])
                ?? FirestoreValueDecoder.string(data["asset_name"])
                ?? "Asset \(entityID)"
            let status = FirestoreValueDecoder.string(data["status"]) ?? "active"
            let updatedAt = FirestoreValueDecoder.date(data["updated_at"])
                ?? FirestoreValueDecoder.date(data["created_at"])
            return (title, status, entityID, updatedAt)
        case PMEntityType.reminder.rawValue:
            let entityID = FirestoreValueDecoder.string(data["reminder_id"]) ?? fallbackID
            let title = FirestoreValueDecoder.string(data["category"])
                ?? FirestoreValueDecoder.string(data["reminder_title"])
                ?? "Reminder \(entityID)"
            let status = (FirestoreValueDecoder.bool(data["status"]) ?? false) ? "active" : "inactive"
            let updatedAt = FirestoreValueDecoder.date(data["created_date"])
                ?? FirestoreValueDecoder.date(data["updated_at"])
            return (title, status, entityID, updatedAt)
        case PMEntityType.document.rawValue:
            let entityID = FirestoreValueDecoder.string(data["document_id"]) ?? fallbackID
            let title = FirestoreValueDecoder.string(data["name"])
                ?? FirestoreValueDecoder.string(data["title"])
                ?? FirestoreValueDecoder.string(data["original_filename"])
                ?? "Document \(entityID)"
            let status = FirestoreValueDecoder.string(data["status"]) ?? "uploaded"
            let updatedAt = FirestoreValueDecoder.date(data["upload_date"])
                ?? FirestoreValueDecoder.date(data["updated_at"])
            return (title, status, entityID, updatedAt)
        case PMEntityType.inventory.rawValue:
            let entityID = FirestoreValueDecoder.string(data["inventory_list_id"]) ?? fallbackID
            let title = FirestoreValueDecoder.string(data["title"]) ?? "Inventory \(entityID)"
            let status = FirestoreValueDecoder.string(data["status"]) ?? "draft"
            let updatedAt = FirestoreValueDecoder.date(data["updated_datetime"])
                ?? FirestoreValueDecoder.date(data["updated_at"])
            return (title, status, entityID, updatedAt)
        default:
            let entityID = fallbackID
            let title = FirestoreValueDecoder.string(data["title"]) ?? fallbackID
            let status = FirestoreValueDecoder.string(data["status"]) ?? "N/A"
            let updatedAt = FirestoreValueDecoder.date(data["updated_at"])
            return (title, status, entityID, updatedAt)
        }
    }

    func loadServiceProviders(keyword: String, location: String, minRating: Double) async {
        isLoadingSP = true
        defer { isLoadingSP = false }

        #if canImport(FirebaseFirestore)
        do {
            let snapshot = try await Firestore.firestore().collection(FirestoreSchema.Collections.users).limit(to: 200).getDocuments()
            let normalizedKeyword = keyword.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            let normalizedLocation = location.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

            serviceProviders = snapshot.documents.compactMap { doc in
                let data = doc.data()
                let roles = parseRoles(from: data)
                guard roles.contains("SP") else { return nil }

                let name = FirestoreValueDecoder.string(data["sp_name"])
                    ?? FirestoreValueDecoder.string(data["display_name"])
                    ?? FirestoreValueDecoder.string(data["name"])
                    ?? "SP \(doc.documentID)"
                let serviceTypes = data["service_types"] as? [String] ?? []
                let serviceArea = FirestoreValueDecoder.string(data["service_area"]) ?? FirestoreValueDecoder.string(data["location"]) ?? "N/A"
                let rating = FirestoreValueDecoder.double(data["rating"]) ?? 0
                let responseTime = FirestoreValueDecoder.string(data["avg_response_time"]) ?? "N/A"
                let priceBand = FirestoreValueDecoder.string(data["price_band"]) ?? "N/A"

                if rating < minRating {
                    return nil
                }
                if !normalizedKeyword.isEmpty {
                    let haystack = "\(name) \(serviceTypes.joined(separator: " "))".lowercased()
                    if !haystack.contains(normalizedKeyword) {
                        return nil
                    }
                }
                if !normalizedLocation.isEmpty, !serviceArea.lowercased().contains(normalizedLocation) {
                    return nil
                }

                return ServiceProviderSummary(
                    id: doc.documentID,
                    name: name,
                    serviceArea: serviceArea,
                    serviceTypes: serviceTypes,
                    rating: rating,
                    responseTime: responseTime,
                    priceBand: priceBand
                )
            }
            errorMessage = nil
        } catch {
            serviceProviders = []
            errorMessage = error.localizedDescription
        }
        #else
        serviceProviders = [
            ServiceProviderSummary(id: "local-sp-1", name: "Apex Plumbing", serviceArea: "Seattle", serviceTypes: ["Plumbing"], rating: 4.8, responseTime: "2h", priceBand: "$$")
        ]
        #endif
    }

    func loadSPCards(ownerID: String) async {
        guard !ownerID.isEmpty else { return }
        isLoadingSPCards = true
        defer { isLoadingSPCards = false }

        #if canImport(FirebaseFirestore)
        do {
            var docs: [QueryDocumentSnapshot] = []
            if let ownerDocs = try? await FirestoreQueryHelper.collectionDocs(
                collectionID: FirestoreSchema.Collections.spCards,
                userID: ownerID,
                userFieldCandidates: ["owner_id"],
                limit: 200
            ) {
                docs.append(contentsOf: ownerDocs)
            }
            if let userDocs = try? await FirestoreQueryHelper.collectionDocs(
                collectionID: FirestoreSchema.Collections.spCards,
                userID: ownerID,
                userFieldCandidates: ["user_id"],
                limit: 200
            ) {
                docs.append(contentsOf: userDocs)
            }

            var merged: [String: QueryDocumentSnapshot] = [:]
            for doc in docs {
                merged[doc.reference.path] = doc
            }

            spCards = merged.values.map { doc in
                let data = doc.data()
                let snapshot = data["card_snapshot"] as? [String: Any] ?? [:]
                return SPCardSummary(
                    id: doc.documentID,
                    spID: FirestoreValueDecoder.string(data["sp_id"]) ?? "N/A",
                    spName: FirestoreValueDecoder.string(snapshot["sp_name"]) ?? "N/A",
                    serviceTypes: snapshot["service_types"] as? [String] ?? [],
                    serviceArea: FirestoreValueDecoder.string(snapshot["service_area"]) ?? "N/A",
                    rating: FirestoreValueDecoder.double(snapshot["rating"]) ?? 0,
                    responseTime: FirestoreValueDecoder.string(snapshot["avg_response_time"]) ?? "N/A",
                    priceBand: FirestoreValueDecoder.string(snapshot["price_band"]) ?? "N/A",
                    ownerNote: FirestoreValueDecoder.string(data["owner_note"]) ?? "",
                    tags: data["tags"] as? [String] ?? [],
                    updatedAt: FirestoreValueDecoder.date(data["updated_at"])
                )
            }
            .sorted { (lhs, rhs) in
                (lhs.updatedAt ?? .distantPast) > (rhs.updatedAt ?? .distantPast)
            }
            errorMessage = nil
        } catch {
            spCards = []
            errorMessage = error.localizedDescription
        }
        #else
        spCards = [
            SPCardSummary(
                id: "local-card-1",
                spID: "local-sp-1",
                spName: "Apex Plumbing",
                serviceTypes: ["Plumbing"],
                serviceArea: "Seattle",
                rating: 4.8,
                responseTime: "2h",
                priceBand: "$$",
                ownerNote: "Preferred vendor for emergency leak.",
                tags: ["urgent", "trusted"],
                updatedAt: Date()
            )
        ]
        #endif
    }

    func saveSPCard(sp: ServiceProviderSummary, ownerID: String) async {
        guard !ownerID.isEmpty else { return }
        #if canImport(FirebaseFirestore)
        do {
            let payload: [String: Any] = [
                "owner_id": ownerID,
                "sp_id": sp.id,
                "owner_note": "",
                "tags": [],
                "saved_at": Date(),
                "updated_at": Date(),
                "card_snapshot": [
                    "sp_name": sp.name,
                    "service_types": sp.serviceTypes,
                    "service_area": sp.serviceArea,
                    "rating": sp.rating,
                    "avg_response_time": sp.responseTime,
                    "price_band": sp.priceBand
                ]
            ]
            _ = try await Firestore.firestore().collection(FirestoreSchema.Collections.spCards).addDocument(data: payload)
            await loadSPCards(ownerID: ownerID)
        } catch {
            errorMessage = error.localizedDescription
        }
        #endif
    }

    func updateSPCard(cardID: String, ownerNote: String, tagsRaw: String, ownerID: String) async {
        let tags = tagsRaw
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        #if canImport(FirebaseFirestore)
        do {
            try await Firestore.firestore()
                .collection(FirestoreSchema.Collections.spCards)
                .document(cardID)
                .setData([
                    "owner_note": ownerNote,
                    "tags": tags,
                    "updated_at": Date()
                ], merge: true)
            await loadSPCards(ownerID: ownerID)
        } catch {
            errorMessage = error.localizedDescription
        }
        #endif
    }

    func removeSPCard(cardID: String, ownerID: String) async {
        #if canImport(FirebaseFirestore)
        do {
            try await Firestore.firestore()
                .collection(FirestoreSchema.Collections.spCards)
                .document(cardID)
                .delete()
            await loadSPCards(ownerID: ownerID)
        } catch {
            errorMessage = error.localizedDescription
        }
        #endif
    }

    private func parseRoles(from payload: [String: Any]) -> [String] {
        var rawRoles: [String] = []
        for key in ["role", "role_code", "user_role"] {
            if let role = payload[key] as? String {
                rawRoles.append(role)
            }
        }
        if let list = payload["roles"] as? [String] {
            rawRoles.append(contentsOf: list)
        }

        var normalized: [String] = []
        for value in rawRoles {
            for role in AppRole.normalized(value) where !normalized.contains(role.rawValue) {
                normalized.append(role.rawValue)
            }
        }
        return normalized
    }
}

struct PMRecordsView: View {
    @EnvironmentObject private var session: SessionManager
    @StateObject private var viewModel = PMRecordsViewModel()

    @State private var mode = 0
    @State private var entityType = "task"
    @State private var keyword = ""
    @State private var propertyFilter = ""
    @State private var statusFilter = ""
    @State private var actorFilter = ""
    @State private var useDateRange = false
    @State private var dateFrom = Date()
    @State private var dateTo = Date()
    @State private var spLocation = ""
    @State private var minRating = 0.0
    @State private var selectedCardID: String?
    @State private var editingNote = ""
    @State private var editingTags = ""

    private let recordTypes = ["property", "task", "asset", "reminder", "lease", "document", "transaction", "inventory"]

    var body: some View {
        List {
            Picker("Mode", selection: $mode) {
                Text("Records").tag(0)
                Text("Search SP").tag(1)
                Text("SP Cards").tag(2)
            }
            .pickerStyle(.segmented)

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .font(.footnote)
                    .foregroundStyle(.orange)
            }

            if mode == 0 {
                Section("Filters") {
                    Picker("Entity", selection: $entityType) {
                        ForEach(recordTypes, id: \.self) { type in
                            Text(type.humanizedFieldName).tag(type)
                        }
                    }
                    .pickerStyle(.menu)
                    TextField("Search keyword", text: $keyword)
                    TextField("property_filter", text: $propertyFilter)
                    TextField("status_filter", text: $statusFilter)
                    TextField("actor_filter", text: $actorFilter)
                    Toggle("Enable date_range", isOn: $useDateRange)
                    if useDateRange {
                        DatePicker("date_from", selection: $dateFrom, displayedComponents: .date)
                        DatePicker("date_to", selection: $dateTo, displayedComponents: .date)
                    }
                    Button("Load Records") {
                        Task {
                            await viewModel.loadRecords(
                                userID: session.userID,
                                entityType: entityType,
                                keyword: keyword,
                                propertyFilter: propertyFilter,
                                statusFilter: statusFilter,
                                actorFilter: actorFilter,
                                dateFrom: useDateRange ? dateFrom : nil,
                                dateTo: useDateRange ? dateTo : nil
                            )
                        }
                    }
                }

                Section("Results") {
                    if viewModel.isLoadingRecords {
                        ProgressView("Loading records...")
                    } else if viewModel.records.isEmpty {
                        Text("No records found.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(viewModel.records) { item in
                            NavigationLink {
                                PMRecordDetailView(recordPath: item.id, entityType: item.entityType)
                            } label: {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(item.title)
                                        .font(.headline)
                                    Text("Entity ID: \(item.entityID)")
                                        .font(.subheadline)
                                    if !item.propertyID.isEmpty {
                                        Text("Property: \(item.propertyID)")
                                            .font(.subheadline)
                                    }
                                    Text("Status: \(item.status)")
                                        .font(.subheadline)
                                    if let updatedAt = item.updatedAt {
                                        Text(updatedAt.formatted(date: .abbreviated, time: .shortened))
                                            .font(.footnote)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                }
            } else if mode == 1 {
                Section("Search SP") {
                    TextField("Service type / keyword", text: $keyword)
                    TextField("Location", text: $spLocation)
                    HStack {
                        Text("Min Rating")
                        Spacer()
                        Text(minRating.formatted(.number.precision(.fractionLength(1))))
                    }
                    Slider(value: $minRating, in: 0...5, step: 0.5)
                    Button("Search") {
                        Task {
                            await viewModel.loadServiceProviders(keyword: keyword, location: spLocation, minRating: minRating)
                        }
                    }
                }

                Section("Providers") {
                    if viewModel.isLoadingSP {
                        ProgressView("Searching providers...")
                    } else if viewModel.serviceProviders.isEmpty {
                        Text("No SP matched current filters.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(viewModel.serviceProviders) { sp in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(sp.name)
                                    .font(.headline)
                                Text("Types: \(sp.serviceTypes.joined(separator: ", "))")
                                    .font(.subheadline)
                                Text("Area: \(sp.serviceArea)")
                                    .font(.subheadline)
                                Text("Rating: \(sp.rating.formatted(.number.precision(.fractionLength(1)))) | Response: \(sp.responseTime) | Price: \(sp.priceBand)")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                                HStack {
                                    Button("View Profile") {}
                                    Button("Assign to Task") {}
                                    Button("Save Card") {
                                        Task {
                                            await viewModel.saveSPCard(sp: sp, ownerID: session.userID)
                                        }
                                    }
                                }
                                .buttonStyle(.bordered)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            } else {
                Section("SP Cards") {
                    Button("Refresh Cards") {
                        Task {
                            await viewModel.loadSPCards(ownerID: session.userID)
                        }
                    }
                    if viewModel.isLoadingSPCards {
                        ProgressView("Loading cards...")
                    } else if viewModel.spCards.isEmpty {
                        Text("No saved SP cards.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(viewModel.spCards) { card in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(card.spName)
                                    .font(.headline)
                                Text("Service: \(card.serviceTypes.joined(separator: ", "))")
                                    .font(.subheadline)
                                Text("Area: \(card.serviceArea)")
                                    .font(.subheadline)
                                Text("Rating: \(card.rating.formatted(.number.precision(.fractionLength(1)))) | Response: \(card.responseTime) | Price: \(card.priceBand)")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                                if !card.ownerNote.isEmpty {
                                    Text("Note: \(card.ownerNote)")
                                        .font(.footnote)
                                }
                                if !card.tags.isEmpty {
                                    Text("Tags: \(card.tags.joined(separator: ", "))")
                                        .font(.footnote)
                                        .foregroundStyle(.secondary)
                                }
                                if selectedCardID == card.id {
                                    TextField("Owner note", text: $editingNote, axis: .vertical)
                                    TextField("Tags (comma separated)", text: $editingTags)
                                    HStack {
                                        Button("Save") {
                                            Task {
                                                await viewModel.updateSPCard(
                                                    cardID: card.id,
                                                    ownerNote: editingNote,
                                                    tagsRaw: editingTags,
                                                    ownerID: session.userID
                                                )
                                                selectedCardID = nil
                                            }
                                        }
                                        Button("Cancel") {
                                            selectedCardID = nil
                                        }
                                    }
                                }
                                HStack {
                                    Button("Edit Note/Tags") {
                                        selectedCardID = card.id
                                        editingNote = card.ownerNote
                                        editingTags = card.tags.joined(separator: ", ")
                                    }
                                    Button("Open SP Profile") {}
                                    Button("Assign to Task") {}
                                    Button("Remove", role: .destructive) {
                                        Task {
                                            await viewModel.removeSPCard(cardID: card.id, ownerID: session.userID)
                                        }
                                    }
                                }
                                .buttonStyle(.bordered)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
        }
        .navigationTitle("Records")
        .task(id: session.userID) {
            await viewModel.loadRecords(
                userID: session.userID,
                entityType: entityType,
                keyword: keyword,
                propertyFilter: propertyFilter,
                statusFilter: statusFilter,
                actorFilter: actorFilter,
                dateFrom: useDateRange ? dateFrom : nil,
                dateTo: useDateRange ? dateTo : nil
            )
            await viewModel.loadSPCards(ownerID: session.userID)
        }
    }
}

@MainActor
private final class PMRecordDetailViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var fields: [String: String] = [:]
    @Published var rawFields: [(String, String)] = []

    func load(recordPath: String, entityType: String) async {
        isLoading = true
        defer { isLoading = false }
        #if canImport(FirebaseFirestore)
        do {
            let snapshot = try await Firestore.firestore().document(recordPath).getDocument()
            guard let data = snapshot.data() else {
                errorMessage = "Record data not found."
                return
            }
            let orderedKeys = orderedEditableKeys(for: entityType)
            var mapped: [String: String] = [:]
            for key in orderedKeys {
                if let value = data[key] as? String {
                    mapped[key] = value
                } else if let number = FirestoreValueDecoder.double(data[key]) {
                    mapped[key] = String(number)
                } else if let intValue = FirestoreValueDecoder.int(data[key]) {
                    mapped[key] = String(intValue)
                } else if let boolValue = FirestoreValueDecoder.bool(data[key]) {
                    mapped[key] = String(boolValue)
                } else if let dateValue = FirestoreValueDecoder.date(data[key]) {
                    mapped[key] = dateValue.formatted(date: .numeric, time: .omitted)
                } else if let arrayValue = data[key] as? [String] {
                    mapped[key] = arrayValue.joined(separator: ", ")
                } else {
                    mapped[key] = ""
                }
            }
            fields = mapped

            rawFields = data.keys.sorted().map { key in
                let value = data[key]
                if let stringValue = value as? String { return (key, stringValue) }
                if let intValue = FirestoreValueDecoder.int(value) { return (key, String(intValue)) }
                if let doubleValue = FirestoreValueDecoder.double(value) { return (key, String(doubleValue)) }
                if let boolValue = FirestoreValueDecoder.bool(value) { return (key, String(boolValue)) }
                if let dateValue = FirestoreValueDecoder.date(value) {
                    return (key, dateValue.formatted(date: .abbreviated, time: .shortened))
                }
                return (key, "\(value ?? "")")
            }
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
        #endif
    }

    func save(recordPath: String, entityType: String) async {
        #if canImport(FirebaseFirestore)
        do {
            var payload: [String: Any] = [:]
            for key in orderedEditableKeys(for: entityType) {
                let value = fields[key]?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
                if value.isEmpty {
                    continue
                }
                if isArrayField(key) {
                    payload[key] = value
                        .split(separator: ",")
                        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                        .filter { !$0.isEmpty }
                } else if isBoolField(key), entityType == PMEntityType.reminder.rawValue {
                    payload[key] = (value.lowercased() == "true" || value.lowercased() == "active" || value == "1")
                } else if isNumericField(key), let number = Double(value) {
                    payload[key] = number
                } else if isDateField(key), let date = parseDate(value) {
                    if isStringDateField(key) {
                        payload[key] = ISO8601DateFormatter().string(from: date)
                    } else {
                        payload[key] = date
                    }
                } else {
                    payload[key] = value
                }
            }
            payload["entity_type"] = entityType
            try await Firestore.firestore().document(recordPath).setData(payload, merge: true)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
        #endif
    }

    func binding(for key: String) -> Binding<String> {
        Binding<String>(
            get: { self.fields[key, default: ""] },
            set: { self.fields[key] = $0 }
        )
    }

    func orderedEditableKeys(for entityType: String) -> [String] {
        switch entityType {
        case PMEntityType.task.rawValue:
            return ["property_id", "mx_id", "description", "status", "report_date", "task_priority", "assigned_sp_id", "image_urls"]
        case PMEntityType.property.rawValue:
            return ["nickname", "address", "type", "status", "equipments"]
        case PMEntityType.asset.rawValue:
            return ["property_id", "asset_id", "nickname", "type", "location", "brand", "model", "serial", "mfg_date", "acquired_date", "notes", "status", "images"]
        case PMEntityType.reminder.rawValue:
            return ["property_id", "reminder_id", "category", "start_date", "repeat_by", "amount", "note", "status"]
        case PMEntityType.lease.rawValue:
            return ["LSID", "lease_id", "property_string_id", "status", "lease_term", "lease_create_date", "rate_type", "rate_amount", "deposit", "pet_fee", "application_fee_per_person", "utilities_included", "furnished", "special_terms", "additional_notes"]
        case PMEntityType.document.rawValue:
            return ["property_id", "document_id", "name", "description", "file_url", "original_filename", "file_type", "source_type", "source_id", "source_label", "upload_date"]
        case PMEntityType.transaction.rawValue:
            return ["property_id", "transac_id", "role", "transac_from", "transac_to", "amount", "transac_date", "transac_type", "note", "picture_url", "status"]
        case PMEntityType.inventory.rawValue:
            return ["property_id", "inventory_list_id", "lease_id", "property_address", "status", "inventory_type", "items", "created_datetime", "updated_datetime"]
        default:
            return ["property_id", "status"]
        }
    }

    private func isNumericField(_ key: String) -> Bool {
        ["amount", "rent_amount", "rate_amount", "deposit", "pet_fee", "application_fee_per_person", "lease_term", "rating"].contains(key)
    }

    private func isDateField(_ key: String) -> Bool {
        ["due_date", "start_date", "end_date", "reminder_date", "date", "report_date", "transac_date", "lease_create_date", "upload_date", "created_date", "mfg_date", "acquired_date"].contains(key)
    }

    private func isArrayField(_ key: String) -> Bool {
        ["attachments", "items", "tags", "service_types", "image_urls", "images", "utilities_included", "equipments"].contains(key)
    }

    private func isBoolField(_ key: String) -> Bool {
        ["status"].contains(key)
    }

    private func isStringDateField(_ key: String) -> Bool {
        ["report_date", "transac_date", "lease_create_date", "upload_date", "created_date", "mfg_date", "acquired_date", "created_datetime", "updated_datetime"].contains(key)
    }

    private func parseDate(_ text: String) -> Date? {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "M/d/yyyy"
        if let date = formatter.date(from: text) {
            return date
        }
        formatter.dateFormat = "yyyy-MM-dd"
        if let date = formatter.date(from: text) {
            return date
        }
        let iso = ISO8601DateFormatter()
        return iso.date(from: text)
    }
}

struct PMRecordDetailView: View {
    let recordPath: String
    let entityType: String

    @StateObject private var viewModel = PMRecordDetailViewModel()
    @State private var isSaving = false

    var body: some View {
        Form {
            if let errorMessage = viewModel.errorMessage {
                Section {
                    Text(errorMessage)
                        .font(.footnote)
                        .foregroundStyle(.orange)
                }
            }

            Section("Editable") {
                ForEach(viewModel.orderedEditableKeys(for: entityType), id: \.self) { key in
                    if ["description", "notes"].contains(key) {
                        TextField(key, text: viewModel.binding(for: key), axis: .vertical)
                    } else {
                        TextField(key, text: viewModel.binding(for: key))
                    }
                }
            }

            Section("Actions") {
                Button("Save Changes") {
                    Task {
                        isSaving = true
                        defer { isSaving = false }
                        await viewModel.save(recordPath: recordPath, entityType: entityType)
                    }
                }
                .disabled(isSaving)
            }

            if !viewModel.rawFields.isEmpty {
                Section("Raw Fields") {
                    ForEach(viewModel.rawFields, id: \.0) { key, value in
                        HStack(alignment: .top) {
                            Text(key.humanizedFieldName)
                                .foregroundStyle(.secondary)
                            Spacer()
                            Text(value)
                                .multilineTextAlignment(.trailing)
                        }
                        .font(.footnote)
                    }
                }
            }
        }
        .navigationTitle("\(entityType.humanizedFieldName) Detail")
        .overlay {
            if viewModel.isLoading {
                ProgressView("Loading detail...")
            }
        }
        .task(id: recordPath) {
            await viewModel.load(recordPath: recordPath, entityType: entityType)
        }
    }
}

struct PMReportsView: View {
    @EnvironmentObject private var session: SessionManager
    @StateObject private var dashboardViewModel = PMDashboardViewModel()

    var body: some View {
        List {
            Section("Rent Collection Summary") {
                ReportRow(title: "Due", value: "\(dashboardViewModel.snapshot.rentDueCount)")
                ReportRow(title: "Paid", value: "\(dashboardViewModel.snapshot.rentPaidCount)")
                ReportRow(title: "Overdue", value: "\(dashboardViewModel.snapshot.overdueRentCount)")
            }

            Section("Task Status Summary") {
                ReportRow(title: "Open", value: "\(dashboardViewModel.snapshot.openTasksCount)")
                ReportRow(title: "In Progress", value: "\(dashboardViewModel.snapshot.inProgressTasksCount)")
                ReportRow(title: "Resolved", value: "\(dashboardViewModel.snapshot.resolvedTasksCount)")
                ReportRow(title: "Overdue", value: "\(dashboardViewModel.snapshot.overdueTasksCount)")
            }

            Section("Occupancy & Lease Summary") {
                ReportRow(title: "Occupied", value: "\(dashboardViewModel.snapshot.occupiedPropertyCount)")
                ReportRow(title: "Vacant", value: "\(dashboardViewModel.snapshot.vacantPropertyCount)")
                ReportRow(title: "Occupancy Rate", value: "\(Int(dashboardViewModel.snapshot.occupancyRate * 100))%")
                ReportRow(title: "Expiring Soon", value: "\(dashboardViewModel.snapshot.expiringLeasesCount)")
            }

            Section("Income vs Expense Summary") {
                ReportRow(title: "Income", value: dashboardViewModel.snapshot.monthlyIncome.formatted(.currency(code: "USD")))
                ReportRow(title: "Expense", value: dashboardViewModel.snapshot.monthlyExpense.formatted(.currency(code: "USD")))
                ReportRow(title: "Net", value: (dashboardViewModel.snapshot.monthlyIncome - dashboardViewModel.snapshot.monthlyExpense).formatted(.currency(code: "USD")))
            }
        }
        .navigationTitle("Reports")
        .task(id: session.userID) {
            await dashboardViewModel.load(userID: session.userID)
        }
    }
}

private struct ReportRow: View {
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(title)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
        .font(.subheadline)
    }
}

struct PMProfileView: View {
    @EnvironmentObject private var session: SessionManager

    var body: some View {
        RoleAwareProfileView(
            title: "Profile",
            roleDescription: session.roleDisplayName,
            showOrganization: true,
            showBilling: true
        )
    }
}

@MainActor
private final class SPDashboardViewModel: ObservableObject {
    @Published var openAssignments: Int = 0
    @Published var inProgressAssignments: Int = 0
    @Published var isLoading = false
    @Published var errorMessage: String?

    func load(userID: String) async {
        guard !userID.isEmpty else { return }
        isLoading = true
        defer { isLoading = false }

        #if canImport(FirebaseFirestore)
        do {
            let docs = try await FirestoreQueryHelper.collectionGroupDocs(
                collectionID: FirestoreSchema.Collections.mxrecords,
                userID: userID,
                userFieldCandidates: ["assigned_sp_id", "sp_id", "assigned_to", "user_id"],
                limit: 300
            )
            var open = 0
            var inProgress = 0
            for doc in docs {
                let status = (FirestoreValueDecoder.string(doc.data()[FirestoreSchema.CommonFields.status]) ?? "").lowercased()
                if ["open", "new", "pending"].contains(status) {
                    open += 1
                } else if ["in_progress", "working"].contains(status) {
                    inProgress += 1
                }
            }
            openAssignments = open
            inProgressAssignments = inProgress
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
        #else
        openAssignments = 3
        inProgressAssignments = 1
        #endif
    }
}

struct SPDashboardView: View {
    @EnvironmentObject private var session: SessionManager
    @StateObject private var viewModel = SPDashboardViewModel()

    var body: some View {
        List {
            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .font(.footnote)
                    .foregroundStyle(.orange)
            }

            Section("Work Summary") {
                MetricRow(title: "Open Assignments", value: "\(viewModel.openAssignments)")
                MetricRow(title: "In Progress", value: "\(viewModel.inProgressAssignments)")
            }
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView("Loading...")
            }
        }
        .navigationTitle("Dashboard")
        .task(id: session.userID) {
            await viewModel.load(userID: session.userID)
        }
    }
}

@MainActor
private final class SPRecordsViewModel: ObservableObject {
    struct Assignment: Identifiable {
        let id: String
        let title: String
        let status: String
        let updatedAt: Date?
    }

    @Published var assignments: [Assignment] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    func load(userID: String) async {
        guard !userID.isEmpty else { return }
        isLoading = true
        defer { isLoading = false }

        #if canImport(FirebaseFirestore)
        do {
            let docs = try await FirestoreQueryHelper.collectionGroupDocs(
                collectionID: FirestoreSchema.Collections.mxrecords,
                userID: userID,
                userFieldCandidates: ["assigned_sp_id", "sp_id", "assigned_to", "user_id"],
                limit: 200
            )
            assignments = docs.map { doc in
                let data = doc.data()
                let title = FirestoreValueDecoder.string(data[FirestoreSchema.TaskFields.titleCandidates[0]])
                    ?? FirestoreValueDecoder.string(data[FirestoreSchema.TaskFields.titleCandidates[1]])
                    ?? FirestoreValueDecoder.string(data["title"])
                    ?? doc.documentID
                let status = FirestoreValueDecoder.string(data[FirestoreSchema.CommonFields.status]) ?? "N/A"
                return Assignment(
                    id: doc.reference.path,
                    title: title,
                    status: status,
                    updatedAt: FirestoreValueDecoder.date(data[FirestoreSchema.CommonFields.updatedAt])
                )
            }
            errorMessage = nil
        } catch {
            assignments = []
            errorMessage = error.localizedDescription
        }
        #else
        assignments = [Assignment(id: "local-a-1", title: "Fix HVAC", status: "open", updatedAt: Date())]
        #endif
    }
}

struct SPRecordsView: View {
    @EnvironmentObject private var session: SessionManager
    @StateObject private var viewModel = SPRecordsViewModel()

    var body: some View {
        List {
            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .font(.footnote)
                    .foregroundStyle(.orange)
            }

            Section("Assigned Tasks") {
                if viewModel.isLoading {
                    ProgressView("Loading tasks...")
                } else if viewModel.assignments.isEmpty {
                    Text("No assigned task yet.")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(viewModel.assignments) { item in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.title)
                                .font(.headline)
                            Text("Status: \(item.status)")
                                .font(.subheadline)
                            if let updatedAt = item.updatedAt {
                                Text(updatedAt.formatted(date: .abbreviated, time: .shortened))
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Records")
        .task(id: session.userID) {
            await viewModel.load(userID: session.userID)
        }
    }
}

struct SPProfileView: View {
    @EnvironmentObject private var session: SessionManager

    var body: some View {
        RoleAwareProfileView(
            title: "Profile",
            roleDescription: session.roleDisplayName,
            showOrganization: false,
            showBilling: true
        )
    }
}

private struct RoleAwareProfileView: View {
    @EnvironmentObject private var session: SessionManager

    let title: String
    let roleDescription: String
    let showOrganization: Bool
    let showBilling: Bool

    var body: some View {
        List {
            Section("Account") {
                ProfileValueRow(label: "User ID", value: session.userID)
                ProfileValueRow(label: "Email", value: session.userEmail.isEmpty ? "N/A" : session.userEmail)
                ProfileValueRow(label: "Role", value: roleDescription)
                if showOrganization {
                    ProfileValueRow(label: "Organization", value: "N/A")
                }
            }

            if showBilling {
                Section("Plan / Usage") {
                    ProfileValueRow(label: "Plan Code", value: "N/A")
                    ProfileValueRow(label: "Subscription", value: "N/A")
                    ProfileValueRow(label: "Credit Balance", value: "N/A")
                }
            }

            RoleSwitchSection()
        }
        .navigationTitle(title)
    }
}

private struct RoleSwitchSection: View {
    @EnvironmentObject private var session: SessionManager

    var body: some View {
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
}

private struct ProfileValueRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
    }
}
