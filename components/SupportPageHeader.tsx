import Link from "next/link";
import LogoWhite from "./LogoWhite";
import BlueHeaderLeftImage from "./icons/BlueHeaderLeftImage";

type SupportPageHeaderProps = {
    width?: number;
    height?: number;
    isNav?: boolean;
};

export default function SupportPageHeader(props: SupportPageHeaderProps) {
    const { width, height, isNav } = props;
    return (
        <div className="support-page-header text-center mb-5 position-relative">
            <BlueHeaderLeftImage className="position-absolute left-0" isNav={isNav} />
            <Link href={"/"}>
                <LogoWhite height={height ?? 90} width={width ?? 44} />
            </Link>
        </div>
    );
}
