import Foundation

struct TenantDashboardSnapshot {
    var rentDueDate: Date?
    var leaseStartDate: Date?
    var leaseEndDate: Date?
    var myTasksOpenCount: Int
    var myTasksInProgressCount: Int
    var myTasksResolvedCount: Int
    var latestPaymentAmount: Double?
    var latestPaymentDate: Date?
    var latestReceiptAmount: Double?
    var latestReceiptDate: Date?

    static let empty = TenantDashboardSnapshot(
        rentDueDate: nil,
        leaseStartDate: nil,
        leaseEndDate: nil,
        myTasksOpenCount: 0,
        myTasksInProgressCount: 0,
        myTasksResolvedCount: 0,
        latestPaymentAmount: nil,
        latestPaymentDate: nil,
        latestReceiptAmount: nil,
        latestReceiptDate: nil
    )
}
