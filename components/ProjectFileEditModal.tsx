import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { TagInput } from "./ResourceForm";
import { InfoCircle } from "iconsax-react";

export type FileEditData = {
    id: string;
    fileName: string;
    originalName: string;
    tags: TagInput[];
    visibility?: "public" | "private";
};

type ProjectFileEditModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    fileData: FileEditData | null;
    tagSuggestions: TagInput[];
    onSave: (fileId: string, fileName: string, tags: TagInput[], visibility?: "public" | "private") => void;
    showTagsField?: boolean;
    fieldLabel?: "fileName" | "description";
};

export default function ProjectFileEditModal({
    showModal,
    setShowModal,
    fileData,
    tagSuggestions,
    onSave,
    showTagsField = true,
    fieldLabel = "description",
}: ProjectFileEditModalProps) {
    const [fileName, setFileName] = useState("");
    const [selectedTags, setSelectedTags] = useState<TagInput[]>([]);
    const [visibility, setVisibility] = useState<"public" | "private">("public");

    useEffect(() => {
        if (fileData && showModal) {
            setFileName(fileData.fileName);
            setSelectedTags(fileData.tags || []);
            setVisibility(fileData.visibility || "public");
        }
    }, [fileData, showModal]);

    const handleSave = () => {
        if (fileData && fileName.trim()) {
            onSave(fileData.id, fileName.trim(), selectedTags, visibility);
            setShowModal(false);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setFileName("");
        setSelectedTags([]);
        setVisibility("public");
    };

    const handleTagsChange = (newTags: TagInput[]) => {
        if (newTags.length > 5) {
            newTags.pop();
        }
        setSelectedTags(newTags);
    };

    const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const isAlphanumeric = /^[a-zA-Z0-9 ]*$/;
        if (isAlphanumeric.test(value) || value === "") {
            setFileName(value);
        }
    };

    const displayName = fileName || fileData?.fileName || fileData?.originalName || "attachment";
    const labelText = fieldLabel === "fileName" ? "File Name" : "Description";
    const placeholderText = fieldLabel === "fileName" ? "Enter file name" : "Enter description";

    return (
        <Modal centered show={showModal} onHide={handleClose} className="file-edit-modal" size="lg">
            <Modal.Header closeButton className="pb-2">
                <Modal.Title className="tb-title-subsection-medium">Edit {displayName}</Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-2">
                <p className="text-muted tb-body-small-regular mb-4">Please enter relevant details</p>

                <Form>
                    <Form.Group className="mb-4">
                        <Form.Label className="text-gray-600 tb-body-small-medium">
                            {labelText} <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={fileName}
                            onChange={handleFileNameChange}
                            placeholder={placeholderText}
                            className="form-control"
                            required
                        />
                        <small className="text-gray-500 tb-body-extra-small-regular mt-1">
                            Only letters, numbers and spaces are allowed
                        </small>
                    </Form.Group>

                    {showTagsField && (
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Tags</Form.Label>
                            <CreatableSelect
                                value={selectedTags}
                                isMulti
                                isClearable
                                options={tagSuggestions}
                                onChange={value => handleTagsChange(value as TagInput[])}
                                openMenuOnFocus={true}
                                noOptionsMessage={() => "No more tags"}
                                placeholder="Add keywords to your resource"
                                className="react-select-container tb-body-small-medium"
                                classNamePrefix="react-select"
                            />
                            <small className="text-gray-500 tb-body-extra-small-regular d-flex align-items-center gap-2 mt-2">
                                <InfoCircle variant="Bold" size={16} color="#4F4F4F" />
                                Keyword for ease of search
                            </small>
                        </Form.Group>
                    )}

                    <Form.Group className="mb-4 d-flex justify-content-between">
                        <Form.Label
                            htmlFor="mark-as-private"
                            className="d-flex align-items-center m-0 pointer text-gray-600 tb-body-small-medium"
                        >
                            Mark as private
                        </Form.Label>

                        <Form.Check
                            id="mark-as-private"
                            type="switch"
                            className="d-flex justify-content-end big"
                            checked={visibility === "private"}
                            onChange={e => {
                                setVisibility(e.target.checked ? "private" : "public");
                            }}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer className="pt-3 border-top">
                <div className="d-flex gap-3 w-100">
                    <Button
                        variant="outline-secondary"
                        onClick={handleClose}
                        className="flex-fill tb-body-default-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!fileName.trim()}
                        className="flex-fill tb-body-default-medium"
                    >
                        Save Changes
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
