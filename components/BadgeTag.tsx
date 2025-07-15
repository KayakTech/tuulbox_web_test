import { Badge } from "react-bootstrap";

type BadgeTagProps = {
    tag: string;
    className?: string;
};

export default function BadgeTag({ tag, className }: BadgeTagProps) {
    return (
        <span>
            <Badge className={`badge-tag tb-body-extra-small-regular ${className ?? ""}`}>{tag}</Badge>
        </span>
    );
}
