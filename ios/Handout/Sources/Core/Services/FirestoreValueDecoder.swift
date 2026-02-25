import Foundation

#if canImport(FirebaseFirestore)
import FirebaseFirestore
#endif

enum FirestoreValueDecoder {
    static func string(_ value: Any?) -> String? {
        value as? String
    }

    static func int(_ value: Any?) -> Int? {
        if let v = value as? Int { return v }
        if let v = value as? NSNumber { return v.intValue }
        return nil
    }

    static func double(_ value: Any?) -> Double? {
        if let v = value as? Double { return v }
        if let v = value as? NSNumber { return v.doubleValue }
        return nil
    }

    static func bool(_ value: Any?) -> Bool? {
        if let v = value as? Bool { return v }
        if let v = value as? NSNumber { return v.boolValue }
        return nil
    }

    static func date(_ value: Any?) -> Date? {
        #if canImport(FirebaseFirestore)
        if let ts = value as? Timestamp {
            return ts.dateValue()
        }
        #endif
        if let d = value as? Date {
            return d
        }
        if let seconds = value as? TimeInterval {
            return Date(timeIntervalSince1970: seconds)
        }
        if let n = value as? NSNumber {
            return Date(timeIntervalSince1970: n.doubleValue)
        }
        if let s = value as? String {
            let iso = ISO8601DateFormatter()
            if let date = iso.date(from: s) {
                return date
            }
            let short = DateFormatter()
            short.locale = Locale(identifier: "en_US_POSIX")
            short.timeZone = TimeZone(secondsFromGMT: 0)
            short.dateFormat = "yyyy-MM-dd"
            return short.date(from: s)
        }
        return nil
    }
}
