import Foundation

#if canImport(UIKit)
import UIKit
#endif

enum ImageCompressionError: LocalizedError {
    case decodeFailed
    case cannotCompressToLimit

    var errorDescription: String? {
        switch self {
        case .decodeFailed:
            return "Failed to decode image data."
        case .cannotCompressToLimit:
            return "Image cannot be compressed to <= 1 MB."
        }
    }
}

enum ImageCompressionService {
    static let maxImageBytes = 1_000_000

    static func compressToMVPSize(_ data: Data) throws -> Data {
        #if canImport(UIKit)
        guard let image = UIImage(data: data) else {
            throw ImageCompressionError.decodeFailed
        }

        var compression: CGFloat = 0.9
        while compression >= 0.1 {
            if let jpeg = image.jpegData(compressionQuality: compression), jpeg.count <= maxImageBytes {
                return jpeg
            }
            compression -= 0.1
        }
        throw ImageCompressionError.cannotCompressToLimit
        #else
        if data.count <= maxImageBytes {
            return data
        }
        throw ImageCompressionError.cannotCompressToLimit
        #endif
    }
}
