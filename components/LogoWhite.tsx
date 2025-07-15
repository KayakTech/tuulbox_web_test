import Image from "next/image";

type LogoWhiteProps = {
    width?: any;
    height?: any;
};

export default function LogoWhite({ width, height }: LogoWhiteProps) {
    return (
        <Image
            width={width || 105.5}
            height={height || 28.4}
            src="/images/logo-white.svg"
            priority
            alt={"tuulbox Logo"}
        />
    );
}
