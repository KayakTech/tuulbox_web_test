import Image from "next/image";

type ProfileItemState = {
    imageUrl: string;
    text1?: string;
    text2?: string;
};
export default function ProfileItem({ imageUrl, text1, text2 }: ProfileItemState) {
    return (
        <div className="d-flex small">
            <Image src={imageUrl} width={20} height={20} alt="user" />
            <span className="ms-3">
                <p className="mb-1 text-muted">{text1}</p>
                <p className="mb-0">{text2}</p>
            </span>
        </div>
    );
}
