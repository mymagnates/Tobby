import Foundation

enum TaskPriority: String, CaseIterable, Identifiable, Codable {
    case low
    case medium
    case high

    var id: String { rawValue }
    var displayName: String { rawValue.capitalized }
}

struct TenantTaskDraft: Identifiable, Codable {
    let id: String
    var taskTitle: String
    var taskDescription: String
    var taskCategory: String
    var taskPriority: TaskPriority
    var propertyID: String
    var unitID: String
    var photoCount: Int
    var createdAt: Date
    var updatedAt: Date

    init(
        id: String = UUID().uuidString,
        taskTitle: String,
        taskDescription: String,
        taskCategory: String = "",
        taskPriority: TaskPriority,
        propertyID: String,
        unitID: String = "",
        photoCount: Int = 0,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.taskTitle = taskTitle
        self.taskDescription = taskDescription
        self.taskCategory = taskCategory
        self.taskPriority = taskPriority
        self.propertyID = propertyID
        self.unitID = unitID
        self.photoCount = photoCount
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
