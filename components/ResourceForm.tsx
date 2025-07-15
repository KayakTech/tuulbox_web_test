import DashboardLayout from "@/components/DashboardLayout";
import { Form, Button, Card, Row, Col, Modal } from "react-bootstrap";
import { useState, useEffect, useRef, FormEvent } from "react";
import { isValidUrl } from "@/helpers";
import ButtonLoader from "@/components/ButtonLoader";
import DI from "@/di-container";
import { Resource, Tag } from "@/repositories/resource-repository";
import { CheckCircle } from "react-feather";
import Link from "next/link";
import CreatableSelect from "react-select/creatable";
import { useRouter } from "next/router";
import PageLoader from "./PageLoader";
import FeedbackModal from "./FeedbackModal";
import FormErrorMessage from "./FormErrorMessage";
import Required from "./Required";
import { DocumentCopy, InfoCircle } from "iconsax-react";
import FormLayout from "./FormLayout";
import { prependHttp } from "@/helpers";
import useResource from "@/hooks/useResources";
import { error } from "console";
import { ChangeEvent } from "preact/compat";
import { useToast } from "@/context/ToastContext";

export type TagInput = { value: string; label: string };
type ResourceFormState = {
    action: string;
};
export default function ResourceForm(props: ResourceFormState) {
    const { action } = props;
    const router = useRouter();
    const { errors, setErrors } = useResource();

    const [resourceLink, setResourceLink] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [tags, setTags] = useState<TagInput[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [autoFocus, setAutoFocus] = useState<boolean>(false);
    const [tagSuggestions, setTagSuggestions] = useState<TagInput[]>([]);
    const [page, setPage] = useState<number>(1);
    const [resourceId, setResourceId] = useState<string>("");
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [embeddedUrl, setEmbeddedUrl] = useState("");
    const [url, setUrl] = useState("");
    const tagsSelector = useRef(null);
    const { showToast } = useToast();

    function handleAddAgain() {
        if (action === "add") {
            window.location.reload();
        }
        if (action === "edit") {
            setShowModal(false);
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        if (!resourceLink) {
            setErrors({ ...errors, url: "Please enter a valid url." });
            return;
        }

        if (!description) {
            setErrorMessage("Please add a description.");
            return;
        }

        setIsAdding(true);

        const formattedTags = tags.map(tag => tag.value);
        const payload = {
            tagsName: formattedTags,
            url: prependHttp(resourceLink),
            description: description,
        } as Resource;

        if (action === "add") addResource(payload, { callbackUrl: "/links" });
        if (action === "edit") updateResource(payload, { callbackUrl: "/links" });
    }

    async function addResource(payload: Resource, props?: { callbackUrl: string }) {
        try {
            const res = await DI.resourceService.addResource(payload);
            showToast({ heading: "Success", message: "Link added.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error) {
        } finally {
            setIsAdding(false);
        }
    }

    async function updateResource(payload: Resource, props?: { callbackUrl: string }) {
        payload.id = resourceId;
        try {
            const res = await DI.resourceService.updateResource(payload);
            showToast({ heading: "Success", message: "Link updated.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error) {
        } finally {
            setIsAdding(false);
        }
    }

    function handleTagsChange(newTags: any) {
        if (newTags.length > 5) {
            newTags.pop();
        }

        if (newTags.length >= 5) {
            // @ts-ignore
            tagsSelector?.current?.blur();
        }
        setTags(newTags);
        setAutoFocus(true);
    }

    async function getTags() {
        try {
            const res = await DI.resourceService.getTags(page);
            let preparedTags = res.results.map((tag: any) => {
                return { value: tag.name, label: tag.name };
            });
            setTagSuggestions(preparedTags);
        } catch (error) {}
    }

    async function getResource(id: string) {
        setIsLoading(true);
        try {
            const res = await DI.resourceService.getResource(id);
            setResourceLink(res.url);
            setDescription(res.description);

            let newTags: TagInput[] = await res.tags.map((tag: Tag) => {
                return { value: tag.name, label: tag.name };
            });

            setTags(newTags);
            setIsLoading(false);
        } catch (error) {
            router.push("/links");
        }
    }

    useEffect(() => {
        getTags();
    }, []);

    useEffect(() => {
        if (action === "edit") {
            const id = window.location.pathname.split("/")[3];
            setResourceId(id);
            getResource(id);
        }
    }, [action]);

    function handleUrlInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!isValidUrl(e.target.value)) {
            const theErrors = { ...errors, url: "Please enter a valid url" };
            setErrors(theErrors);
        } else {
            const theErrors = { ...errors, url: "" };
            setErrors(theErrors);
        }
        setResourceLink(e.target.value);
    }
    return (
        <DashboardLayout
            breadCrumbs={[
                { name: "Links", url: `/links` },
                { name: `${action === "add" ? "New link" : "Update link"}` },
            ]}
            pageTitle={action === "add" ? "Add new link" : "Edit Link"}
        >
            <div className="">
                {action === "edit" && isLoading ? (
                    <PageLoader />
                ) : (
                    <FormLayout
                        leftSideIcon={<DocumentCopy size="24" color="#888888" className="me-2" />}
                        leftSideText={action === "add" ? "New link" : "Update link"}
                        leftSideDescription={
                            action === "add"
                                ? "Fill in the correct details to create a new link"
                                : "Fill in the correct details to update link"
                        }
                    >
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Link or URL <Required />
                                </Form.Label>
                                <Form.Control
                                    className={`${errors?.url ? "border-red-700" : ""}`}
                                    type="text"
                                    value={resourceLink}
                                    onChange={handleUrlInputChange}
                                    minLength={1}
                                    maxLength={200}
                                    placeholder="Ex. https://medium.com/how-to-bake-cake"
                                    required
                                />
                                {errors?.url && <small className="text-danger">{errors?.url}</small>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Description <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    minLength={1}
                                    placeholder="E.g Jones construction"
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label className="text-gray-600 tb-body-small-medium">Tag</Form.Label>
                                <CreatableSelect
                                    ref={tagsSelector}
                                    defaultValue={tags}
                                    isMulti
                                    isClearable
                                    autoFocus={autoFocus}
                                    options={tagSuggestions}
                                    onChange={handleTagsChange}
                                    openMenuOnFocus={true}
                                    noOptionsMessage={() => "No more tags"}
                                    placeholder="Add keywords to your link"
                                />
                                <small className="text-muted d-flex align-items-center gap-2 mt-2">
                                    <InfoCircle variant="Bold" size={16} color="#4F4F4F" /> Keyword for ease of search
                                </small>
                            </Form.Group>

                            <div className="mt-4">
                                {errorMessage && <FormErrorMessage message={errorMessage} />}
                                <div className="d-flex gap-20 w-100">
                                    <Link href={`/links`} className="text-decoration-none">
                                        <Button
                                            className="w-140 btn-140 tb-title-body-medium"
                                            variant="outline-secondary"
                                            size="lg"
                                            disabled={isAdding}
                                        >
                                            Cancel
                                        </Button>
                                    </Link>

                                    <Button
                                        className="w-100 btn-240 text-center  tb-title-body-medium"
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={errors?.url || !resourceLink || !description}
                                    >
                                        {isAdding ? (
                                            <ButtonLoader
                                                buttonText={action === "edit" ? "Updating..." : "Adding..."}
                                            />
                                        ) : action === "edit" ? (
                                            "Save changes"
                                        ) : (
                                            "Add Link"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </FormLayout>
                )}

                <FeedbackModal
                    icon={<CheckCircle color="green" size={50} />}
                    showModal={showModal}
                    setShowModal={setShowModal}
                    primaryButtonText={"Go to links"}
                    primaryButtonUrl={"/links"}
                    secondaryButtonText={action === "edit" ? "Close" : "Add another link"}
                    feedbackMessage={feedbackMessage}
                    onSecondaryButtonClick={handleAddAgain}
                />
            </div>
        </DashboardLayout>
    );
}
