import { Spinner } from "react-bootstrap";

type PageLoaderState = {
    heightClass?: string;
    showLoading?: boolean;
};
export default function PageLoader(props: PageLoaderState) {
    const { heightClass, showLoading = true } = props;
    return (
        <div
            className={`page-loader d-flex justify-content-center align-items-center w-100 ${heightClass ?? "h-75vh"}`}
        >
            {showLoading && <Spinner animation="border" variant="dark" className="" />}
        </div>
    );
}
