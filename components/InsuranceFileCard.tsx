import { Card, Row, Col, Dropdown, Button } from "react-bootstrap";
import Link from "next/link";
import { MoreHorizontal, Copy, Trash2, X } from "react-feather";
import { Download } from "react-iconly";
import { StorageFile } from "@/repositories/storage-repository";
import Image from "next/image";
import { ReceiveSquare } from "iconsax-react";

type InsuranceFileCardState = {
    file: Partial<StorageFile> | undefined;
    onDelete: (file: Partial<StorageFile> | undefined) => void;
    isEditing?: boolean;
};

export default function InsuranceFileCard(props: InsuranceFileCardState) {
    const { file, onDelete, isEditing } = props;
    return (
        <Card className="file-card overflow-hidden">
            <Card.Body className="p-0 bg-light border-0 d-flex">
                <span className="m-auto">
                    <Image src="/images/svg/icons/file-text.svg" width={50} height={50} alt="" />
                </span>
            </Card.Body>
            <Card.Footer className="py-3 border-top bg-transparent">
                <Row className="g-2">
                    <Col xs={9} className="d-flex align-items-center">
                        <Link
                            href={`${file?.file}`}
                            className="text-decoration-none text-muted text-truncate btn-sm d-flex align-items-center"
                            title={file?.originalFileName}
                            target="_blank"
                        >
                            {file?.originalFileName}
                        </Link>
                    </Col>
                    <Col xs={3}>
                        {isEditing ? (
                            <Button
                                variant="secondary"
                                className="btn-sm-square p-0 d-flex ms-auto"
                                onClick={() => onDelete(file)}
                            >
                                <X size={20} className="text-danger m-auto p-0" />
                            </Button>
                        ) : (
                            <Dropdown className="w-100 text-end">
                                <Dropdown.Toggle
                                    size="sm"
                                    variant="secondary"
                                    className="btn-sm-square"
                                    id="dropdown-basic"
                                >
                                    <MoreHorizontal size={24} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align={`end`}>
                                    <Dropdown.Item href={file?.file} target="_blank">
                                        <ReceiveSquare size={16} />{" "}
                                        <span className="tb-body-default-regular">Download</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => onDelete(file)}>
                                        <Trash2 size={16} className="me-2" />{" "}
                                        <span className="tb-body-default-regular text-danger">Delete</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </Col>
                </Row>
            </Card.Footer>
        </Card>
    );
}
