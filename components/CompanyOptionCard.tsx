import { Card } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import Buildings2 from "./icons/Buildings2";
import People from "./icons/People";

export type CompanyOptionCardState = {
    imageUrl: string;
    title: string;
    description: string;
    url: string;
};

export default function CompanyOptionCard(props: CompanyOptionCardState) {
    const { imageUrl, title, description, url } = props;
    return (
        <Link href={url} className="text-decoration-none">
            <Card className="h-100 w-100 company-option-card" style={{ minHeight: "170px" }}>
                <Card.Body className="d-flex align-items-center p-24 h-100">
                    <div>
                        {title.toLowerCase() === "company details" ? <Buildings2 /> : <People />}
                        <h4 className="mt-5  tb-body-large-medium">{title}</h4>
                        <p className="text-muted m-0">{description}</p>
                    </div>
                </Card.Body>
            </Card>
        </Link>
    );
}
