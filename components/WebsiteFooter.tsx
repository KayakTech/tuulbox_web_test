import Link from "next/link";
import { Container } from "react-bootstrap";

export default function WebsiteFooter() {
    return (
        <footer className="bg-gray-50 py-4 mt-5">
            <Container>
                <div className="d-flex justify-content-between flex-column flex-md-row gap-2">
                    <ul className="list-unstyled m-0">
                        <li className="text-muted text-center text-md-start">
                            <Link href="/privacy-policy" target="_blank" className="text-muted">
                                Privacy
                            </Link>
                            <span className="mx-4">|</span>
                            <Link href="/terms-and-conditions" target="_blank" className="text-muted">
                                Terms
                            </Link>
                        </li>
                    </ul>
                    <ul className="list-unstyled m-0">
                        <li className="text-center text-md-start">
                            <p className="text-muted m-0">&copy; 2024 tuulbox. All rights reserved</p>
                        </li>
                    </ul>
                </div>
            </Container>
        </footer>
    );
}
