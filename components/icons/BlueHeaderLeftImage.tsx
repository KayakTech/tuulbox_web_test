import Image from "next/image";

type BlueHeaderLeftImageProps = {
    width?: number | string;
    height?: number | string;
    className?: string;
    isNav?: boolean;
};
export default function BlueHeaderLeftImage(props: BlueHeaderLeftImageProps) {
    const { width, height, className, isNav } = props;
    return isNav ? (
        <svg
            width={width || "53"}
            height={height || "96"}
            viewBox="0 0 65 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M-0.125 -2.63281H64.6592L-0.125 95.5422V-2.63281Z" fill="#822328" />
            <path d="M-0.125 95.5422V-2.63281H41.2133" fill="white" />
            <path d="M-0.125 95.5422V-2.63281H41.2133" stroke="#822328" strokeWidth="0.02125" strokeMiterlimit="10" />
        </svg>
    ) : (
        <svg
            width={width || "53"}
            height={height || ""}
            viewBox="0 0 64 100"
            fill="none"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M1 1H53L1 95.4307V1Z" fill="#822328" />
            <path d="M1 95.4307V1H34.1808" fill="white" />
            <path d="M1 95.4307V1H34.1808" stroke="#822328" strokeWidth="0.15" strokeMiterlimit="10" />
        </svg>
    );
}
