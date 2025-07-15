import Image from "next/image";

type LogoProps = {
    width?: any;
    height?: any;
};

export default function Logo({ width, height }: LogoProps) {
    return (
        <Image width={width || 105.5} height={height || 28.4} src="/images/logo.svg" priority alt={"tuulbox Logo"} />
    );
}
