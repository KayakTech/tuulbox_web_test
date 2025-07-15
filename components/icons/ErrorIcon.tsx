type ErrorIconProps = {
    width?: number;
    height?: number;
    color?: string;
    className?: string;
};

export default function ErrorIcon({ width, height, color = "#D42E37" }: ErrorIconProps) {
    return (
        <svg
            width={width || 20}
            height={height || 20}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
        >
            <circle cx="10" cy="10" r="9" fill={color} />
            <path
                d="M10 4.5C9.5875 4.5 9.25 4.8375 9.25 5.25V11.25C9.25 11.6625 9.5875 12 10 12C10.4125 12 10.75 11.6625 10.75 11.25V5.25C10.75 4.8375 10.4125 4.5 10 4.5Z"
                fill="white"
            />
            <path
                d="M10 13.5C9.5875 13.5 9.25 13.8375 9.25 14.25C9.25 14.6625 9.5875 15 10 15C10.4125 15 10.75 14.6625 10.75 14.25C10.75 13.8375 10.4125 13.5 10 13.5Z"
                fill="white"
            />
        </svg>
    );
}
