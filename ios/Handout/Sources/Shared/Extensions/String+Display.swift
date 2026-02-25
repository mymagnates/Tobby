import Foundation

extension String {
    var humanizedFieldName: String {
        let separatorNormalized = self.replacingOccurrences(of: "_", with: " ")
        let parts = separatorNormalized.split(separator: " ")
        return parts.map { word in
            let lower = word.lowercased()
            switch lower {
            case "id":
                return "ID"
            case "sp":
                return "SP"
            case "tt":
                return "TT"
            case "pm":
                return "PM"
            case "po":
                return "PO"
            default:
                return lower.prefix(1).uppercased() + lower.dropFirst()
            }
        }.joined(separator: " ")
    }
}
