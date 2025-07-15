import { DocumentText } from "iconsax-react";
import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "react-feather";

export interface UploadFile {
    id: string;
    name: string;
    size: number;
    progress: number;
    status: string;
    error?: string;
}

interface UploadStorageProgressProps {
    files: UploadFile[];
    onRetry: (fileId: string) => void;
    onRemove: (fileId: string) => void;
    onHide: () => void;
    totalFiles: number;
}

const UploadStorageProgress: React.FC<UploadStorageProgressProps> = ({
    files,
    onRetry,
    onRemove,
    onHide,
    totalFiles,
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const completedFiles = files?.filter(f => f.status === "completed").length;
    const failedFiles = files?.filter(f => f.status === "failed").length;
    const uploadingFiles = files?.filter(f => f.status === "uploading").length;
    const inProgressCount = uploadingFiles + failedFiles;

    const formatFileSize = (bytes: number) => {
        return (bytes / 1024).toFixed(0) + " kB";
    };

    const CircularProgress = ({ progress, status }: { progress: number; status: string }) => {
        const radius = 8;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        return (
            <div className="position-relative d-inline-flex align-items-center justify-content-center">
                <svg width="32" height="32" className="position-absolute">
                    <circle cx="16" cy="16" r={radius} stroke="#e5e7eb" strokeWidth="2.5" fill="transparent" />
                    <circle
                        cx="16"
                        cy="16"
                        r={radius}
                        stroke={status === "completed" ? "#10b981" : status === "failed" ? "#ef4444" : "#10b981"}
                        strokeWidth="2.5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 16 16)"
                        style={{
                            transition: "stroke-dashoffset 0.3s ease-in-out",
                        }}
                    />
                </svg>
                <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px" }}
                >
                    {status === "completed" ? (
                        <CheckCircle size={16} style={{ color: "#10b981" }} />
                    ) : status === "failed" ? (
                        <AlertCircle size={14} style={{ color: "#ef4444" }} />
                    ) : null}
                </div>
            </div>
        );
    };

    return (
        <div
            className="position-fixed shadow-lg bg-white border d-flex flex-column"
            style={{
                bottom: "20px",
                right: "20px",
                zIndex: 1050,
                width: "400px",
                maxHeight: "500px",
                borderRadius: "8px",
                overflow: "hidden",
                borderColor: "#e5e7eb",
            }}
        >
            <div
                className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom flex-shrink-0"
                style={{ borderBottomColor: "#f3f4f6" }}
            >
                <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0" style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                        Upload in progress
                    </h6>
                </div>
                <button className="btn btn-link p-0 border-0" onClick={onHide} style={{ color: "#9ca3af" }}>
                    <X size={16} />
                </button>
            </div>

            {showDetails && (
                <div
                    className="border-bottom flex-grow-1"
                    style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        borderBottomColor: "#f3f4f6",
                        minHeight: 0,
                    }}
                >
                    <div className="p-4">
                        {files.map(file => (
                            <div
                                key={file.id}
                                className="mb-3 p-3"
                                style={{
                                    borderRadius: "8px",
                                    borderStyle: "dashed",
                                    borderWidth: "2px",
                                    borderColor: file.status === "failed" ? "#fca5a5" : "#e5e7eb",
                                    backgroundColor: file.status === "failed" ? "#fef2f2" : "#f9fafb",
                                }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <DocumentText size={40} variant="Bold" color="#D1D1D1" />
                                    </div>

                                    <div
                                        className="flex-grow-1 d-flex align-items-center justify-content-between"
                                        style={{ minWidth: 0 }}
                                    >
                                        <div>
                                            <p
                                                className="mb-1"
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    color: "#111827",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    maxWidth: "200px",
                                                }}
                                                title={file.name}
                                            >
                                                {file.name}
                                            </p>
                                            {file.status === "completed" && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                                        {formatFileSize(file.size)}
                                                    </span>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <CheckCircle size={12} style={{ color: "#10b981" }} />
                                                        <span
                                                            style={{
                                                                fontSize: "12px",
                                                                color: "#059669",
                                                                fontWeight: "500",
                                                            }}
                                                        >
                                                            Completed
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {file.status === "uploading" && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <CircularProgress progress={file.progress} status={file.status} />
                                                    <span
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "#059669",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        {file.progress}% Uploading
                                                    </span>
                                                </div>
                                            )}
                                            {file.status === "failed" && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <AlertCircle size={12} style={{ color: "#ef4444" }} />
                                                    <span
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "#dc2626",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Upload failed!
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                            {file.status === "failed" && (
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => onRetry(file.id)}
                                                    title="Retry upload"
                                                    style={{
                                                        fontSize: "12px",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        borderColor: "#2563eb",
                                                        color: "#2563eb",
                                                        backgroundColor: "transparent",
                                                    }}
                                                >
                                                    <RefreshCw size={12} className="me-1" />
                                                    Retry
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-link p-0 border-0"
                                                onClick={() => onRemove(file.id)}
                                                style={{ color: "#9ca3af" }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-4 py-3 flex-shrink-0">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ position: "relative" }}>
                            <svg
                                className="position-relative"
                                width="16"
                                height="16"
                                fill="none"
                                viewBox="0 0 24 24"
                                style={{
                                    animation: "spin 1s linear infinite",
                                    color: "#10b981",
                                }}
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </div>
                        <span style={{ fontSize: "14px", color: "#6b7280" }}>
                            Uploading {inProgressCount}/{totalFiles} attachments
                        </span>
                    </div>
                    <button
                        className="btn btn-link p-0 border-0 d-flex align-items-center"
                        onClick={() => setShowDetails(!showDetails)}
                        style={{ fontSize: "14px", color: "#6b7280" }}
                    >
                        {showDetails ? "Hide details" : "Show details"}
                        {showDetails ? (
                            <ChevronUp size={14} className="ms-1" />
                        ) : (
                            <ChevronDown size={14} className="ms-1" />
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default UploadStorageProgress;
