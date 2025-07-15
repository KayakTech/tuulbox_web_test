import InviteIcon from "@/components/icons/Invite";
import useProject from "@/hooks/project";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import { ProjectInviteResponse } from "@/repositories/project-repository";
import { useRouter } from "next/router";
import { CloseCircle, InfoCircle, TickCircle } from "iconsax-react";

export function getSenderName(projectInvite: ProjectInviteResponse) {
    const firstName = projectInvite?.projectObject?.createdBy?.firstName;
    const lastName = projectInvite?.projectObject?.createdBy?.lastName;
    if (!firstName && !lastName) return projectInvite?.projectObject.createdBy?.email;
    return `${firstName} ${lastName}`;
}

function AppStoreAndPlayStoreButton() {
    return (
        <div className="d-flex gap-4 mt-4 justify-content-center">
            <Link href={`${process.env.NEXT_PUBLIC_APP_STORE_APP_URL}`} target="_blank">
                <Image src={`/images/svg/applestore-download.svg`} width={165} height={46} alt="" />
            </Link>
            <Link href={`${process.env.NEXT_PUBLIC_PLAY_STORE_APP_URL}`} target="_blank">
                <Image src={`/images/svg/playstore-download.svg`} width={165} height={46} alt="" />
            </Link>
        </div>
    );
}

export default function InviteId() {
    const router = useRouter();
    const {
        isLoading,
        getInvitedProject,
        setPathId,
        projectInvite,
        acceptOrDeclineInvite,
        isAcceptingInvite,
        isRejectingInvite,
    } = useProject({});

    useEffect(() => {
        const inviteId = window.location.pathname.split("/")[2];
        setPathId(inviteId);
        getInvitedProject(inviteId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isPending = projectInvite?.status === "pending";

    if (isLoading) return <PageLoader />;

    if (!projectInvite) return <InviteNotFound />;

    if (!isPending)
        return (
            <AlreadyAcceptedInvite
                projectInvite={projectInvite!}
                inviteAccepted={projectInvite?.status === "accepted"}
            />
        );

    return (
        <Container className="h-100vh d-flex align-items-center justify-content-center">
            <Row className="justify-content-around">
                <Col sm={12} className="text-center d-flex flex-column justify-content-center align-items-center">
                    <Link href={`/`} className="">
                        <InviteIcon />
                    </Link>
                    <h1 className="fw-600 fs-24 mt-4 mb-12">Accept invitation</h1>
                    <p className="fs-16 text-muted mb-40">
                        <span>{getSenderName(projectInvite)}</span> invited you to collaborate on the{" "}
                        <span>{projectInvite?.projectObject?.name ?? "project"}</span>
                    </p>
                    <div className="d-flex gap-4 justify-content-center">
                        <Button
                            variant="outline-primary"
                            className="w-100"
                            onClick={() =>
                                acceptOrDeclineInvite({
                                    projectId: projectInvite.id,
                                    status: "rejected",
                                })
                            }
                        >
                            {isRejectingInvite ? <Spinner animation="border" /> : "Decline"}
                        </Button>
                        <Button
                            variant="primary"
                            className="w-100"
                            onClick={() =>
                                acceptOrDeclineInvite({
                                    projectId: projectInvite.id,
                                    status: "accepted",
                                })
                            }
                        >
                            {isAcceptingInvite ? <Spinner animation="border" /> : "Accept"}
                        </Button>
                    </div>

                    <Button
                        variant="link"
                        className="mt-4 text-decoration-none"
                        onClick={() => {
                            router.push(`/`);
                        }}
                    >
                        Skip Invite
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

type AlreadyAcceptedInviteProps = {
    projectInvite: ProjectInviteResponse;
    inviteAccepted: boolean;
};

function AlreadyAcceptedInvite({ projectInvite, inviteAccepted }: AlreadyAcceptedInviteProps) {
    const router = useRouter();

    function getIcon() {
        // rejected, accepted, expired
        if (projectInvite.status === "rejected")
            return (
                <div className="bg-danger-weak p-3 rounded-circle">
                    <CloseCircle color="#C53030" size={40} />
                </div>
            );

        if (projectInvite.status === "expired")
            return (
                <div className="bg-info-weak p-3 rounded-circle">
                    <InfoCircle color="#2B6CB0" size={40} />
                </div>
            );

        if (projectInvite.status === "accepted")
            return (
                <div className="bg-success-weak p-3 rounded-circle">
                    <TickCircle color="#17CF97" size={40} />
                </div>
            );
    }

    function getDescription() {
        if (projectInvite.status === "rejected")
            return (
                <>
                    <span>
                        You can’t collaborate on this project because you previously declined the invite and your access
                        has been revoked. If this was a mistake, you can reach out to the project owner to request a new
                        invite.
                    </span>
                </>
            );

        if (projectInvite.status === "expired")
            return (
                <>
                    <span>Oops! Looks like your project invite from {getSenderName(projectInvite)} has expired.</span>
                    <br />
                    <span>
                        No worries — you can still reach out to the project owner to get a fresh invite and hop back in.
                        If you&apos;re curious about tuulbox, you can learn more about whtat we do
                    </span>
                </>
            );

        if (projectInvite.status === "accepted")
            return (
                <>
                    <span>
                        You can now collaborate on this project. You can access the project from the projects page.
                    </span>
                </>
            );
    }

    return (
        <Container className="h-100vh d-flex align-items-center justify-content-center">
            <Row className="justify-content-around">
                <Col sm={7} className="text-center d-flex flex-column align-items-center justify-content-center">
                    {getIcon()}
                    <h1 className="fw-600 fs-24 mt-4 mb-12 ">
                        Invite <span className="text-capitalize">{projectInvite.status}</span>{" "}
                    </h1>
                    <p className="fs-16 text-muted mb-40">{getDescription()}</p>
                    <div className="d-flex gap-4 justify-content-center">
                        {inviteAccepted && (
                            <Button
                                className="px-4"
                                variant="outline-primary"
                                onClick={() => {
                                    router.push(`/projects/${projectInvite.projectObject.id}`);
                                }}
                            >
                                Go to Project
                            </Button>
                        )}

                        <Button
                            variant="primary"
                            onClick={() => {
                                router.push(`/`);
                            }}
                        >
                            Go to App
                        </Button>
                    </div>

                    <AppStoreAndPlayStoreButton />
                </Col>
            </Row>
        </Container>
    );
}

function InviteNotFound() {
    return (
        <Container className="h-100vh d-flex align-items-center justify-content-center">
            <Row className="justify-content-around">
                <Col sm={12} className="text-center d-flex flex-column justify-content-center align-items-center">
                    <Link href={`/`} className="">
                        <div className="bg-danger-weak p-3 rounded-circle">
                            <InfoCircle color="#C53030" size={40} />
                        </div>
                    </Link>
                    <EmptyState
                        headerText="Invite Not Found"
                        descriptionText="The invite link you are trying to access is invalid. Please check the link and try again or you can continue on tuulbox."
                        buttonText="Go to App"
                        buttonUrl="/"
                        showButtonIcon={false}
                    />
                    <AppStoreAndPlayStoreButton />
                </Col>
            </Row>
        </Container>
    );
}
