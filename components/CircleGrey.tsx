export default function CircleGrey(props: {
    children: any;
    active?: boolean;
    className?: string;
    height?: number;
    width?: number;
}) {
    const { children, active, className, height, width } = props;
    return (
        <span
            className={`bg-gray-50 rounded-circle d-flex me-2 avatar-cirle position-relative ${active ? "active" : ""}`}
            style={{ width: width ? `${width}px` : "40px", height: height ? `${height}px` : "40px" }}
        >
            <span className={`m-auto ${className ?? ""}`}>{children}</span>
        </span>
    );
}
