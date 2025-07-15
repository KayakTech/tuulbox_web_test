import { Card, Row, Col, Dropdown, Button } from "react-bootstrap";
import Link from "next/link";
import { MoreHorizontal, Trash2 } from "react-feather";
import { Download, Iconly } from "react-iconly";
import Image from "next/image";
import { useRouter } from "next/router";
import { ProjectDocumentType } from "@/repositories/project-repository";
import { ReceiveSquare } from "iconsax-react";
import { StorageFile } from "@/repositories/storage-repository";

export type FileAttachment = StorageFile;

type FileCardState = {
    file?: FileAttachment | null;
    onDelete: (document: any) => void;
    onUpdate?: (document?: any) => void;
    redirectOnUpdate?: boolean;
    document?: ProjectDocumentType;
    showTag?: boolean;
};

export default function FileCard(props: FileCardState) {
    const router = useRouter();
    const { file, onDelete, onUpdate, redirectOnUpdate = true, document, showTag = false } = props;

    function handleUpdate() {
        if (!onUpdate) router.push(`/storage/edit/${file?.id}`);
        if (onUpdate) onUpdate(document);
    }

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
                            href={file?.file || "#"}
                            className="text-decoration-none text-muted text-truncate btn-sm d-flex align-items-center"
                            title={file?.originalFileName}
                            target="_blank"
                        >
                            {document?.name || file?.originalFileName}
                        </Link>
                    </Col>
                    <Col xs={3}>
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
                                {file?.file ? (
                                    <Dropdown.Item href={file?.file} target="_blank">
                                        <ReceiveSquare className="" size={16} />{" "}
                                        <span className="tb-body-default-regular">Download</span>
                                    </Dropdown.Item>
                                ) : null}
                                <Dropdown.Item onClick={handleUpdate}>
                                    <Iconly set="light" name="Edit" />{" "}
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => onDelete(document || file)}>
                                    <Trash2 size={16} className="" />{" "}
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    {showTag ? (
                        <Col md={12}>
                            <small className="bg-grey px-2" style={{ borderRadius: ".25rem" }}>
                                User
                            </small>
                        </Col>
                    ) : null}
                </Row>
            </Card.Footer>
        </Card>
    );
}
