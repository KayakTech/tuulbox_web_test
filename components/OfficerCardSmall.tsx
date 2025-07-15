import { formatPhoneNumber, formatPhoneNumberWithSpace } from "@/helpers";
import { Officer } from "@/repositories/business-repository";
import { ArrowRight2, Edit, Edit2, User } from "iconsax-react";
import Link from "next/link";
import { Button, Card, Col, Dropdown, Row } from "react-bootstrap";
import { MoreHorizontal, Trash } from "react-feather";

type OfficerCardSmallProps = {
    officer: Partial<Officer>;
    onUpdate: () => void;
    onDelete: () => void;
};

export default function OfficerCardSmall(props: OfficerCardSmallProps) {
    const { officer, onUpdate, onDelete } = props;
    return (
        <Card
            onClick={() => (window.location.href = `/business/company/officers/${officer.id}`)}
            className="pointer contact-card-width contact-card w-100"
        >
            <Card.Body className="text-center d-flex align-items-center justify-content-center px-28 py-28">
                <div className="d-flex flex-column align-items-center">
                    <div className="icon-box mb-2 tb-title-medium text-gray-800">
                        {officer?.firstname?.charAt(0) ?? ""}
                        {officer?.lastname?.charAt(0) ?? ""}
                    </div>

                    <p className="truncate-1 mb-0 tb-body-default-medium text-gray-700">
                        {officer?.firstname ?? ""} {officer?.lastname ?? ""}
                    </p>
                    {(officer?.email || officer?.mobileNumber) && (
                        <p className="mt-1 mb-0 truncate-1 text-muted tb-body-small-regular">
                            {officer.mobileNumber && (
                                <a
                                    href={`tel:${officer.mobileNumber}`}
                                    className="text-decoration-none tb-body-small-regular"
                                >
                                    {officer.mobileNumber}
                                </a>
                            )}
                            {officer.email && officer.mobileNumber && `, `}
                            {officer.email && (
                                <a
                                    title={officer?.email.toLowerCase()}
                                    href={`mailto:${officer.email}`}
                                    className="text-decoration-none"
                                >
                                    {officer?.email.toLowerCase()}
                                </a>
                            )}
                        </p>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
