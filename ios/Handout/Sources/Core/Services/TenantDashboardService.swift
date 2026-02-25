import Foundation

#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

protocol TenantDashboardServiceProtocol {
    func fetchDashboard(userID: String) async throws -> TenantDashboardSnapshot
}

final class TenantDashboardService: TenantDashboardServiceProtocol {
    private let taskUserFields = FirestoreSchema.TaskFields.createdByCandidates
    private let leaseUserFields = FirestoreSchema.LeaseFields.userCandidates
    private let transactionUserFields = FirestoreSchema.TransactionFields.userCandidates

    func fetchDashboard(userID: String) async throws -> TenantDashboardSnapshot {
        #if canImport(FirebaseFirestore)
        async let taskSnapshot = fetchTaskCounts(userID: userID)
        async let leaseSnapshot = fetchLeaseInfo(userID: userID)
        async let financeSnapshot = fetchFinanceInfo(userID: userID)

        let tasks = try await taskSnapshot
        let lease = try await leaseSnapshot
        let finance = try await financeSnapshot

        return TenantDashboardSnapshot(
            rentDueDate: lease.rentDueDate,
            leaseStartDate: lease.startDate,
            leaseEndDate: lease.endDate,
            myTasksOpenCount: tasks.openCount,
            myTasksInProgressCount: tasks.inProgressCount,
            myTasksResolvedCount: tasks.resolvedCount,
            latestPaymentAmount: finance.latestPaymentAmount,
            latestPaymentDate: finance.latestPaymentDate,
            latestReceiptAmount: finance.latestReceiptAmount,
            latestReceiptDate: finance.latestReceiptDate
        )
        #else
        _ = userID
        return TenantDashboardSnapshot.empty
        #endif
    }

    #if canImport(FirebaseFirestore)
    private func fetchTaskCounts(userID: String) async throws -> (openCount: Int, inProgressCount: Int, resolvedCount: Int) {
        let documents = try await FirestoreQueryHelper.collectionGroupDocs(
            collectionID: FirestoreSchema.Collections.mxrecords,
            userID: userID,
            userFieldCandidates: taskUserFields
        )

        var openCount = 0
        var inProgressCount = 0
        var resolvedCount = 0

        for document in documents {
            let status = (document.data()[FirestoreSchema.CommonFields.status] as? String ?? "").lowercased()
            switch status {
            case "open":
                openCount += 1
            case "in_progress", "inprogress":
                inProgressCount += 1
            case "resolved", "closed", "done":
                resolvedCount += 1
            default:
                break
            }
        }
        return (openCount, inProgressCount, resolvedCount)
    }

    private func fetchLeaseInfo(userID: String) async throws -> (startDate: Date?, endDate: Date?, rentDueDate: Date?) {
        let documents = try await FirestoreQueryHelper.collectionDocs(
            collectionID: FirestoreSchema.Collections.leases,
            userID: userID,
            userFieldCandidates: leaseUserFields,
            limit: 20
        )
        let newest = documents.max { lhs, rhs in
            let lDate = FirestoreValueDecoder.date(lhs.data()[FirestoreSchema.CommonFields.updatedAt]) ?? .distantPast
            let rDate = FirestoreValueDecoder.date(rhs.data()[FirestoreSchema.CommonFields.updatedAt]) ?? .distantPast
            return lDate < rDate
        }
        guard let data = newest?.data() else {
            return (nil, nil, nil)
        }
        return (
            FirestoreValueDecoder.date(data[FirestoreSchema.LeaseFields.startDate]),
            FirestoreValueDecoder.date(data[FirestoreSchema.LeaseFields.endDate]),
            FirestoreValueDecoder.date(data[FirestoreSchema.LeaseFields.dueDate])
        )
    }

    private func fetchFinanceInfo(userID: String) async throws -> (latestPaymentAmount: Double?, latestPaymentDate: Date?, latestReceiptAmount: Double?, latestReceiptDate: Date?) {
        let documents = try await FirestoreQueryHelper.collectionGroupDocs(
            collectionID: FirestoreSchema.Collections.transactions,
            userID: userID,
            userFieldCandidates: transactionUserFields
        )

        var latestPaymentAmount: Double?
        var latestPaymentDate: Date?
        var latestReceiptAmount: Double?
        var latestReceiptDate: Date?

        for document in documents {
            let data = document.data()
            let transactionType = (FirestoreValueDecoder.string(data[FirestoreSchema.TransactionFields.typeCandidates[0]]) ??
                FirestoreValueDecoder.string(data[FirestoreSchema.TransactionFields.typeCandidates[1]]) ?? "").lowercased()
            let date = FirestoreValueDecoder.date(data[FirestoreSchema.TransactionFields.dateCandidates[0]]) ??
                FirestoreValueDecoder.date(data[FirestoreSchema.TransactionFields.dateCandidates[1]])
            let amount = FirestoreValueDecoder.double(data[FirestoreSchema.TransactionFields.amount])

            if transactionType == "payment" {
                if latestPaymentDate == nil || (date ?? .distantPast) > (latestPaymentDate ?? .distantPast) {
                    latestPaymentDate = date
                    latestPaymentAmount = amount
                }
            }

            if transactionType == "receipt" {
                if latestReceiptDate == nil || (date ?? .distantPast) > (latestReceiptDate ?? .distantPast) {
                    latestReceiptDate = date
                    latestReceiptAmount = amount
                }
            }
        }

        return (latestPaymentAmount, latestPaymentDate, latestReceiptAmount, latestReceiptDate)
    }
    #endif
}
