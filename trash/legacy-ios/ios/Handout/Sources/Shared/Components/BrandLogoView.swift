import SwiftUI

#if canImport(UIKit)
import UIKit
#endif

struct BrandLogoView: View {
    var body: some View {
        VStack(spacing: 10) {
            logoBody
            Text("Handout")
                .font(.title2.weight(.semibold))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }

    @ViewBuilder
    private var logoBody: some View {
        #if canImport(UIKit)
        if UIImage(named: "AppLogo") != nil {
            Image("AppLogo")
                .resizable()
                .scaledToFit()
                .frame(width: 72, height: 72)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        } else {
            fallbackLogo
        }
        #else
        fallbackLogo
        #endif
    }

    private var fallbackLogo: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(.blue.opacity(0.15))
                .frame(width: 72, height: 72)
            Image(systemName: "building.2.fill")
                .font(.system(size: 30, weight: .semibold))
                .foregroundStyle(.blue)
        }
    }
}
