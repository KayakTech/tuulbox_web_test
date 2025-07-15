type Buildings2Props = {
    width?: number;
    height?: number;
};

export default function Buildings2({ width, height }: Buildings2Props) {
    return (
        <svg
            width={width || 40}
            height={height || 40}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M11.1664 29.9999H6.91638C4.53305 29.9999 3.33301 28.7999 3.33301 26.4165V6.91663C3.33301 4.53329 4.53305 3.33325 6.91638 3.33325H14.083C16.4664 3.33325 17.6663 4.53329 17.6663 6.91663V9.99992"
                stroke="#6D6D6D"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M28.9503 14.0333V32.6334C28.9503 35.3167 27.617 36.6667 24.9337 36.6667H15.2003C12.517 36.6667 11.167 35.3167 11.167 32.6334V14.0333C11.167 11.35 12.517 10 15.2003 10H24.9337C27.617 10 28.9503 11.35 28.9503 14.0333Z"
                stroke="#6D6D6D"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M22.333 9.99992V6.91663C22.333 4.53329 23.5329 3.33325 25.9163 3.33325H33.0829C35.4663 3.33325 36.6663 4.53329 36.6663 6.91663V26.4165C36.6663 28.7999 35.4663 29.9999 33.0829 29.9999H28.9496"
                stroke="#6D6D6D"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16.667 18.3333H23.3337"
                stroke="#6D6D6D"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16.667 23.3333H23.3337"
                stroke="#6D6D6D"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M20 36.6668V31.6667"
                stroke="#6D6D6D"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
