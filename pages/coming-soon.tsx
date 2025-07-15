import SupportPageHeader from "@/components/SupportPageHeader";
import Link from "next/link";
import Image from "next/image";
import { Container } from "react-bootstrap";

export default function ComingSoon() {
    return (
        <>
            <SupportPageHeader />
            <Container fluid>
                <div className="d-flex flex-column justify-content-center w-100 text-center pt-5">
                    <h2 className="fw-700 fs-32 m-0">tuulbox for web, coming soon!</h2>
                    <p className="text-muted m-0 fs-16 mb-3 mt-2">
                        tuulbox for web is on the way. To take it for a ride, you can download the <br /> mobile version
                        from the link below
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Link href={`${process.env.NEXT_PUBLIC_APP_STORE_APP_URL}`} target="_blank">
                            <Image src={`/images/svg/applestore-download.svg`} width={165} height={46} alt="" />
                        </Link>
                        <Link href={`${process.env.NEXT_PUBLIC_PLAY_STORE_APP_URL}`} target="_blank">
                            <Image src={`/images/svg/playstore-download.svg`} width={165} height={46} alt="" />
                        </Link>
                    </div>
                </div>
                <div className="text-center mt-5 mt-md-3 w-100 position-relative">
                    <Image
                        className="d-none d-md-block mx-auto position-relative"
                        src={`/images/svg/app-screenshot.svg`}
                        fill
                        alt="Coming soon"
                        quality={50}
                        priority
                    />
                    <Image
                        className="d-block d-md-none mx-auto position-relative"
                        src={`/images/website/tuulbox-mobile.png`}
                        fill
                        alt="Coming soon"
                        quality={50}
                        priority
                    />
                </div>
            </Container>
        </>
    );
}
