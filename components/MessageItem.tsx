import { useEffect, useState } from "react";
import CircleGrey from "./CircleGrey";
import Image from "next/image";
import { isNumber } from "@/helpers";

type MessageItemProps = {
    data: any;
    onClick: () => void;
    type: MessageType;
};

export enum MessageType {
    text = "text",
    email = "email",
}

export default function MessageItem(props: MessageItemProps) {
    const { data, onClick, type } = props;
    const [avatar, setAvatar] = useState<any>();
    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<any>();
    const [isRead, setIsRead] = useState<boolean>(false);

    useEffect(() => {
        let identity;

        if (type === MessageType.text) {
            isNumber(data.to[0])
                ? (identity = <Image src={`/images/svg/icons/user-grey.svg`} alt="" width={16} height={16} />)
                : (identity = <span className="text-black">{data?.to[0]}</span>);
            setAvatar(identity);
            setTitle(data?.to[0]);
            setBody(data.content);
            setIsRead(data.isRead);
        }

        if (type === MessageType.email) {
            data.createdBy
                ? (identity = <span className="text-black text-capitalize">{data.to[0][0]}</span>)
                : (identity = <Image src={`/images/svg/icons/user-grey.svg`} alt="" width={16} height={16} />);
            setAvatar(identity);
            data.to && setTitle(data.to);
            setBody(`<span class="text-black">${data.subject}</span> - ${data.content}`);
            setIsRead(data.isRead);
        }
    }, [data]);

    return (
        <div
            className={`text-muted font-size-root d-flex align-items-center border-top-0 pointer`}
            onClick={() => onClick()}
        >
            <CircleGrey active={!isRead}>{avatar}</CircleGrey>
            <div>
                <span className={`fw-bold text-black`}>{title}</span>
                <p
                    className="text-truncate mt-1 small mb-0"
                    style={{ width: "500px" }}
                    dangerouslySetInnerHTML={{ __html: body }}
                />
            </div>
        </div>
    );
}
