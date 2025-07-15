import { ArrowRight2 } from "iconsax-react";
import CircleBlue from "./NotificationDot";

export default function NotificationTitle(props: { title: string }) {
    return (
        <div className="container-fluid d-flex flex-row justify-content-between mb-4">
            <div className="d-flex align-items-center">
                <p className="mb-0 me-2">{props.title}</p>
                <CircleBlue className="bg-blue-900" count={4} />
            </div>
            <small>
                See all <ArrowRight2 size="12" color="#222020" />
            </small>
        </div>
    );
}
