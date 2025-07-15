import { ExportSquare } from "iconsax-react";
import { Button, Col } from "react-bootstrap";
import { Iconly } from "react-iconly";
import Link from "next/link";

type OpenLinkButtonProps = {
    option?: any;
    url?: string;
};

export default function OpenLinkButton({ option, url }: OpenLinkButtonProps) {
    return (
        <Link href={`${url || "javascript:void(0)"}`}>
            <Button variant="light" className="open-link bg-gray-50 border-gray-50 g-1 tb-body-default-medium">
                <ExportSquare className="me-2" size="16" color="#4F4F4F" /> <span>Open link</span>
            </Button>
        </Link>
    );
}
