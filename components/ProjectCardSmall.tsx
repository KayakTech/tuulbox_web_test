import { Card, Dropdown } from "react-bootstrap";
import { Project } from "@/repositories/project-repository";
import { ArchiveAdd, ArchiveMinus, Edit2, Star1, StarSlash } from "iconsax-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useProject from "@/hooks/project";
import router from "next/router";
import { MoreHorizontal } from "react-feather";

type ProjectCardState = {
    project: Project;
    onAddToFavorites?: (value: any) => void;
    onDelete?: () => void;
    onArchive?: () => void;
    onInviteUser?: () => void;
    onShareProject?: () => void;
    onRemoveFromRecent?: () => void;
    onRemoveFromFavorites?: () => void;
};

export default function ProjectCard(props: ProjectCardState) {
    const { user } = useSelector((state: RootState) => state.account);
    const { project, onAddToFavorites, onArchive, onRemoveFromRecent, onRemoveFromFavorites } = props;
    const { isCreatorOfProject } = useProject({});

    return (
        <Card className="d-flex gap-12 flex-row align-items-center w-100 p-12 border border-gray-100 rounded-3 shadow-sm cursor-pointer">
            <div
                className="d-flex gap-12 justify-content-betweenm h-46 borderm align-items-center w-100"
                onClick={() => router.push(`/projects/${project.id}`)}
            >
                <Card.Header className="p-0 border-0 overflow-hidden rounded-3 flex-shrink-0 object-fit-cover w-40 h-40 bg-gray-50">
                    <Card.Img
                        className="image w-40 h-40 rounded-3 flex-shrink-0 object-fit-cover"
                        src={project?.projectLogo || `/images/default-image-square.svg`}
                    />
                </Card.Header>
                <div className="d-flex flex-column">
                    <h6 className="text-gray-700 tb-body-default-medium m-0 truncate-1" title={project.name}>
                        {project.name}
                    </h6>
                    {project.isInvited && (
                        <small className="text-gray-500 text-capitalize tb-body-extra-small-medium">Collaborator</small>
                    )}
                </div>
            </div>
            <div className="gap-3 d-flex">
                <Dropdown className="text-end" drop="start">
                    <Dropdown.Toggle
                        className="d-flex align-items-center justify-content-center border-0  bg-gray-50 h-24 w-24 p-0"
                        id="dropdown-basic"
                    >
                        <MoreHorizontal size={16} color="#454545" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="resource-card dropdown-menu" align={`end`}>
                        {isCreatorOfProject(project) && (
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
                                <Dropdown.Item href={`/projects/edit/${project.id}`}>
                                    <Edit2 size={16} color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                            </>
                        )}
                        {!project.inFavorite && (
                            <Dropdown.Item
                                onClick={() => {
                                    const payload = {
                                        objectType: "project",
                                        objectId: project.id,
                                        createdBy: user?.id,
                                        company: user?.companyId,
                                    };
                                    onAddToFavorites?.(payload);
                                }}
                            >
                                <Star1 size={16} color="#888888" />{" "}
                                <span className="tb-body-default-regular">Add to Favorites</span>
                            </Dropdown.Item>
                        )}

                        {project.inFavorite && (
                            <Dropdown.Item
                                onClick={() => {
                                    onRemoveFromFavorites?.();
                                }}
                            >
                                <StarSlash size={16} color="#888888" />{" "}
                                <span className="tb-body-default-regular">Remove from Favorites</span>
                            </Dropdown.Item>
                        )}

                        {onRemoveFromRecent && (
                            <Dropdown.Item
                                onClick={() => {
                                    onRemoveFromRecent?.();
                                }}
                            >
                                <StarSlash size={16} color="#888888" />{" "}
                                <span className="tb-body-default-regular">Remove from Recent</span>
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </Card>
    );
}
