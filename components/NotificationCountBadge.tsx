type NotificatonBadgeProps = {
    count: number;
    customClass?: string;
};
export default function NotificatonCountBadge(props: NotificatonBadgeProps) {
    const { count, customClass } = props;
    return (
        <span className={`${customClass} border-radius-4 w-16 h-16 d-flex justify-content-center align-items-center`}>
            <small>{count}</small>
        </span>
    );
}
