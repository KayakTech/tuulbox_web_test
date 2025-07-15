import { Button, Card, Dropdown, Badge } from "react-bootstrap";
import Image from "next/image";
import { Project } from "@/repositories/project-repository";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import Link from "next/link";
import { ArchiveAdd, ArchiveMinus, Briefcase, Edit2, ExportSquare, Link1, Star1, Trash, UserAdd } from "iconsax-react";
import { Link2, MoreHorizontal } from "react-feather";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useProject from "@/hooks/project";
import { currentPage } from "@/helpers";
import { useRouter } from "next/router";

type ProjectCardState = {
    project: Project;
    onAddToFavorites?: (value: any) => void;
    onDelete?: () => void;
    onArchive?: () => void;
    onInviteUser?: () => void;
    onShareProject?: () => void;
};

export default function ProjectCard(props: ProjectCardState) {
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const { project, onAddToFavorites, onDelete, onArchive, onInviteUser, onShareProject } = props;
    const { isCreatorOfProject } = useProject({});
    return (
        <Card className=" w-100 pointer">
            <Card.Header
                onClick={() => router.push(`/projects/${project.id}`)}
                className=" pb-0 px-2 border-0 bg-transparent border flex-shrink-0 object-fit-cover h-128 align-items-center justify-content-center border-radius-12"
            >
                <div className="flex-shrink-0 p-0  d-flex align-items-center justify-content-center border-radius-12 object-fit-cover bg-gray-50 h-128 w-100">
                    {project?.projectLogo ? (
                        <Card.Img
                            className="image h-128 border-radius-12 flex-shrink-0 p-0 object-fit-cover"
                            src={project?.projectLogo}
                        />
                    ) : (
                        <Briefcase size={32} color="#888888" />
                    )}
                </div>
            </Card.Header>

            <div className="px-0 pt-0 pe-0 w-100 pb-12">
                <div className="d-flex px-12 pt-3 align-items-center justify-content-center">
                    <div className="d-flex justify-content-between w-100 h-46">
                        <div className="d-flex flex-column gap-1">
                            <h6 className="text-gray-700 tb-body-default-medium m-0 truncate-1" title={project.name}>
                                {project.name}
                            </h6>

                            {project.isInvited && (
                                <Badge className="bg-gray-100 px-2 py-1 border-radius-4">
                                    <small className="text-gray-800 text-capitalize tb-body-extra-small-medium">
                                        {" "}
                                        COLLABORATOR
                                    </small>
                                </Badge>
                            )}
                        </div>

                        <div className="gap-3 d-flex">
                            <div>
                                <Dropdown className="text-end w-100" drop="start">
                                    <Dropdown.Toggle
                                        className="btn-square border-radius-40 d-flex align-items-center h-44 w-44 bg-gray-50 border-0"
                                        id="dropdown-basic"
                                    >
                                        <MoreHorizontal size={24} color="#454545" />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu
                                        className="resource-card dropdown-menu"
                                        align={`end`}
                                        onClick={e => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <>
                                            <Dropdown.Item href={`/projects/edit/${project.id}`}>
                                                <Edit2 size={16} color="#888888" />{" "}
                                                <span className="tb-body-default-regular">Update</span>
                                            </Dropdown.Item>

                                            <>
                                                <Dropdown.Item onClick={onArchive}>
                                                    {project.status === "active" ? (
                                                        <ArchiveAdd size={16} color="#888888" />
                                                    ) : (
                                                        <ArchiveMinus size={16} color="#888888" />
                                                    )}
                                                    <span className="tb-body-default-regular">
                                                        {project.status === "active" ? "Archive" : "Unarchive"}
                                                    </span>
                                                </Dropdown.Item>

                                                <Dropdown.Item
                                                    onClick={() => {
                                                        const payload = {
                                                            objectType: "project",
                                                            objectId: project.id,
                                                            createdBy: user?.id,
                                                            company: user?.companyId,
                                                        };
                                                        onAddToFavorites && onAddToFavorites(payload);
                                                    }}
                                                >
                                                    <Star1 size={16} color="#888888" />{" "}
                                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                                </Dropdown.Item>

                                                <Dropdown.Item onClick={onDelete} className="text-danger">
                                                    <Trash size={16} className="" color="#E70000" />{" "}
                                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                                </Dropdown.Item>
                                            </>
                                        </>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
