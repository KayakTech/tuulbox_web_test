import CircleGrey from "./CircleGrey";
import { MessageType } from "./MessageItem";

type MessageItemSearchedProps = {
    onClick: () => void;
    type: MessageType;
    data: any;
};

export default function MessageItemSearched(props: MessageItemSearchedProps) {
    const { onClick, type, data } = props;
    return (
        <div
            className={`font-size-root d-flex flex-row align-items-center border-top-0 pointer w-100`}
            onClick={onClick}
        >
            <CircleGrey active={true}>A</CircleGrey>
            <div className="ms-1 w-100">
                <p className="fw-bold text-black mb-0 d-flex justify-content-between w-100">
                    <span>Email</span>
                    <small className="text-muted">Today, 12:03</small>
                </p>
                <p
                    className="text-truncate mt-1 small mb-0 text-muted overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                    style={{ width: "1200px" }}
                />
            </div>
        </div>
    );
}
