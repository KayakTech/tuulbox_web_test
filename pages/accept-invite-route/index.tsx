import Logo from "@/components/Logo";
import Image from "next/image";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";

export default function AcceptInviteRoute() {
    return (
        <Container className="h-100vh d-flex align-items-center justify-content-center">
            <Row className="justify-content-around">
                <Col sm={12} className="text-center">
                    <Link href={`/`}>
                        <Logo width={111} height={50} />
                    </Link>
                    <h1 className="fw-600 fs-24 mb-0 mt-4">Continue to tuulbox</h1>
                    <p className="fs-16 text-muted my-3">Download the tuulbox app to continue</p>
                    <div className="d-flex gap-4 mt-5 justify-content-center">
                        <Link href={`${process.env.NEXT_PUBLIC_APP_STORE_APP_URL}`} target="_blank">
                            <Image src={`/images/svg/applestore-download.svg`} width={165} height={46} alt="" />
                        </Link>
                        <Link href={`${process.env.NEXT_PUBLIC_PLAY_STORE_APP_URL}`} target="_blank">
                            <Image src={`/images/svg/playstore-download.svg`} width={165} height={46} alt="" />
                        </Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
