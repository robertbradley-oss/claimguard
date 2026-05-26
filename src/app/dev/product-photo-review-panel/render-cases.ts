import type { ProductPhotoReportViewModel } from "@/lib/analysis/product-photo-report-view-model";

export const productPhotoReviewPanelRenderCases = [
  {
    boundary: "product-photo-report-view-model",
    devOnly: true,
    probeOnly: true,
    runtimeLive: false,
    sourceModule: "productPhoto",
    evidenceType: "product-photo",
    reviewTitle: "Limited product-photo review context",
    reviewSummary:
      "Synthetic non-live visual QA case. Local review context is limited, and support may need clearer product-photo evidence before completing manual review.",
    reviewStatus: "Manual review recommended",
    reviewPriority: "Senior review",
    confidence: "Low confidence",
    score: {
      label: "Evidence Reliability Score",
      value: 38,
      scope: "Local evidence quality and review readiness only",
      meaning: "Score reflects product-photo review readiness and local evidence quality only.",
      highScoreMeaning: "High score means the product-photo context may be more useful for local support review.",
      lowOrMediumScoreMeaning:
        "Low or medium score means image quality, product context, or receipt/order matching may require manual review.",
      safetyNote: "High score does not prove the product photo or claim. Manual review may still be required.",
    },
    evidenceQuality: {
      qualityLevel: "Limited",
      qualitySummary:
        "The synthetic summary represents a low-detail product view where image quality may limit reviewer inspection.",
      qualityLimitCount: 3,
    },
    productContext: {
      subjectType: "Close-up product photo",
      productContextStatus: "Additional product context may be needed",
      damageVisibilityReviewContext: "Relevant area needs clearer reviewer context",
      labelContextSummary: "No raw serial, model, barcode, or label value is included in this view model.",
      purchaseOrOrderMatchNeeded: true,
      requestedAdditionalViews: [
        "Wider product photo",
        "Clearer close-up of the relevant area",
        "Receipt or order match",
      ],
    },
    reviewSignals: [
      {
        label: "Photo quality limits review",
        category: "Image Quality",
        severity: "High",
        confidencePercent: 42,
        reviewNote: "Image quality may limit local reviewer inspection.",
        recommendedReviewStep: "Request a clearer product photo only if current detail limits review.",
      },
      {
        label: "Receipt or order match may be needed",
        category: "Purchase Match",
        severity: "Medium",
        confidencePercent: 51,
        reviewNote: "Product-photo context may need comparison with receipt or order evidence.",
        recommendedReviewStep: "Compare product-photo context with available receipt or order evidence.",
      },
    ],
    limitations: [
      "Local product-photo analysis only",
      "External verification was not performed",
      "High score does not prove the product photo or claim",
      "Metadata is context only and raw metadata values are omitted",
      "Additional product or order context may be needed",
    ],
    recommendedSupportAction:
      "Manual review recommended. Request only the additional product view or receipt/order match needed for support review.",
    customerSafeWording:
      "Thanks for the photo. We may need one clearer product view to complete the review.",
    externalVerification: {
      status: "Not externally verified",
      externalVerification: "Not performed",
      summary: "External verification was not performed. Product-photo details remain local review context only.",
    },
    privacy: {
      derivedSummaryOnly: true,
      rawPhotoBytesIncluded: false,
      imageBufferIncluded: false,
      rawExifIncluded: false,
      rawMetadataIncluded: false,
      originalFilenameIncluded: false,
      rawLabelValueIncluded: false,
      providerOutputIncluded: false,
      storageHandleIncluded: false,
      integrationHandleIncluded: false,
      caseQueueHandleIncluded: false,
    },
    isolation: {
      localAnalysisResultRequired: false,
      analyzeEvidenceFileInvoked: false,
      analyzerRoutingInvoked: false,
      uiUploadReportScoringParserFixturePathsInvoked: false,
    },
  },
  {
    boundary: "product-photo-report-view-model",
    devOnly: true,
    probeOnly: true,
    runtimeLive: false,
    sourceModule: "productPhoto",
    evidenceType: "product-photo",
    reviewTitle: "Medium-priority product-photo review",
    reviewSummary:
      "Synthetic non-live visual QA case. Product context is partly useful, but support should compare the photo summary with available purchase evidence before completing manual review.",
    reviewStatus: "Manual review recommended",
    reviewPriority: "Review",
    confidence: "Medium confidence",
    score: {
      label: "Evidence Reliability Score",
      value: 64,
      scope: "Local evidence quality and review readiness only",
      meaning: "Score reflects product-photo review readiness and local evidence quality only.",
      highScoreMeaning: "High score means the product-photo context may be more useful for local support review.",
      lowOrMediumScoreMeaning:
        "Low or medium score means image quality, product context, or receipt/order matching may require manual review.",
      safetyNote: "High score does not prove the product photo or claim. Manual review may still be required.",
    },
    evidenceQuality: {
      qualityLevel: "Usable",
      qualitySummary:
        "The synthetic summary represents usable image context with a few limits that should stay visible to reviewers.",
      qualityLimitCount: 1,
    },
    productContext: {
      subjectType: "Full product context photo",
      productContextStatus: "Product context may be incomplete",
      damageVisibilityReviewContext:
        "Relevant area is visible, but surrounding product context may be needed",
      labelContextSummary: "Label context may be present, but raw label values are omitted.",
      purchaseOrOrderMatchNeeded: true,
      requestedAdditionalViews: ["Packaging context if shipping context matters", "Receipt or order match"],
    },
    reviewSignals: [
      {
        label: "Image consistency needs manual review",
        category: "Image Consistency",
        severity: "Medium",
        confidencePercent: 63,
        reviewNote: "This local-only signal supports manual review priority.",
        recommendedReviewStep: "Have a reviewer inspect the photo evidence before completing support handling.",
      },
      {
        label: "Metadata context is limited",
        category: "Metadata Context",
        severity: "Low",
        confidencePercent: 58,
        reviewNote: "Metadata is context only and raw metadata values are omitted.",
        recommendedReviewStep:
          "Continue review using available product-photo context; do not use metadata status by itself.",
      },
    ],
    limitations: [
      "Local product-photo analysis only",
      "External verification was not performed",
      "High score does not prove the product photo or claim",
      "Metadata is context only and raw metadata values are omitted",
      "Additional product or order context may be needed",
    ],
    recommendedSupportAction:
      "Manual review recommended. Compare the product-photo context with available receipt or order evidence before completing support handling.",
    customerSafeWording:
      "Thanks for the photo. We are reviewing it with the available order information and will follow up if more context is needed.",
    externalVerification: {
      status: "Not externally verified",
      externalVerification: "Not performed",
      summary: "External verification was not performed. Product-photo details remain local review context only.",
    },
    privacy: {
      derivedSummaryOnly: true,
      rawPhotoBytesIncluded: false,
      imageBufferIncluded: false,
      rawExifIncluded: false,
      rawMetadataIncluded: false,
      originalFilenameIncluded: false,
      rawLabelValueIncluded: false,
      providerOutputIncluded: false,
      storageHandleIncluded: false,
      integrationHandleIncluded: false,
      caseQueueHandleIncluded: false,
    },
    isolation: {
      localAnalysisResultRequired: false,
      analyzeEvidenceFileInvoked: false,
      analyzerRoutingInvoked: false,
      uiUploadReportScoringParserFixturePathsInvoked: false,
    },
  },
  {
    boundary: "product-photo-report-view-model",
    devOnly: true,
    probeOnly: true,
    runtimeLive: false,
    sourceModule: "productPhoto",
    evidenceType: "product-photo",
    reviewTitle: "Stronger product-photo context, still manual review",
    reviewSummary:
      "Synthetic non-live visual QA case. Product-photo context is stronger and easier to scan, but it remains local review context and does not complete support handling by itself.",
    reviewStatus: "Manual review recommended",
    reviewPriority: "Manual review",
    confidence: "High confidence",
    score: {
      label: "Evidence Reliability Score",
      value: 86,
      scope: "Local evidence quality and review readiness only",
      meaning: "Score reflects product-photo review readiness and local evidence quality only.",
      highScoreMeaning: "High score means the product-photo context may be more useful for local support review.",
      lowOrMediumScoreMeaning:
        "Low or medium score means image quality, product context, or receipt/order matching may require manual review.",
      safetyNote: "High score does not prove the product photo or claim. Manual review may still be required.",
    },
    evidenceQuality: {
      qualityLevel: "Strong",
      qualitySummary:
        "The synthetic summary represents stronger local review context while preserving proof and verification limits.",
      qualityLimitCount: 0,
    },
    productContext: {
      subjectType: "Full product context photo",
      productContextStatus: "Product context available for review",
      damageVisibilityReviewContext: "Relevant area is visible for reviewer inspection",
      labelContextSummary: "Label context is present for reviewer inspection; raw label values are omitted.",
      purchaseOrOrderMatchNeeded: false,
      requestedAdditionalViews: [],
    },
    reviewSignals: [
      {
        label: "Manual review recommended",
        category: "Recommendation",
        severity: "Medium",
        confidencePercent: 82,
        reviewNote: "This local-only signal supports manual review priority.",
        recommendedReviewStep: "Have a reviewer inspect the photo evidence before completing support handling.",
      },
    ],
    limitations: [
      "Local product-photo analysis only",
      "External verification was not performed",
      "High score does not prove the product photo or claim",
      "Metadata is context only and raw metadata values are omitted",
    ],
    recommendedSupportAction:
      "Manual review recommended. Compare the product-photo context with available receipt or order evidence before completing support handling.",
    customerSafeWording:
      "Thanks for the photo. We are reviewing it with the available order information and will follow up if more context is needed.",
    externalVerification: {
      status: "Not externally verified",
      externalVerification: "Not performed",
      summary: "External verification was not performed. Product-photo details remain local review context only.",
    },
    privacy: {
      derivedSummaryOnly: true,
      rawPhotoBytesIncluded: false,
      imageBufferIncluded: false,
      rawExifIncluded: false,
      rawMetadataIncluded: false,
      originalFilenameIncluded: false,
      rawLabelValueIncluded: false,
      providerOutputIncluded: false,
      storageHandleIncluded: false,
      integrationHandleIncluded: false,
      caseQueueHandleIncluded: false,
    },
    isolation: {
      localAnalysisResultRequired: false,
      analyzeEvidenceFileInvoked: false,
      analyzerRoutingInvoked: false,
      uiUploadReportScoringParserFixturePathsInvoked: false,
    },
  },
] as const satisfies readonly ProductPhotoReportViewModel[];
