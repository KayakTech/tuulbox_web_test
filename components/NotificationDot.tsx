export default function NotificationDot(props: {
    count?: any;
    active?: boolean;
    className?: string;
    height?: number;
    width?: number;
}) {
    const { count, active, className, height, width } = props;
    return (
        <div className={`${className} notification-dot`}>
            <span className="d-flex notification-count">{count}</span>
        </div>
    );
}
