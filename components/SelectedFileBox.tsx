import { Trash } from "iconsax-react";
import PdfIcon from "./icons/PdfIcon";
import Link from "next/link";
import { Button } from "react-bootstrap";
import PDFIConNew from "./icons/PDFIconNew";
import { X } from "react-feather";
import { size, toInteger } from "lodash";

type SelectedFileBoxProps = {
    file: any;
    onDelete?: (file?: any) => void;
    isEditing?: boolean;
    deleteIcon?: any;
    icon?: any;
    showDescription?: boolean;
    size?: any;
    canRemoveFile?: boolean;
};

export default function SelectedFileBox(props: SelectedFileBoxProps) {
    const { file, onDelete, size, isEditing, deleteIcon, icon, showDescription = true, canRemoveFile = true } = props;
    const sizeInMB = toInteger((1024 * 1024).toFixed(2));

    return (
        <div className="d-flex justify-content-between align-items-center selected-file-box gap-3">
            <div className="d-flex align-items-center gap-12">
                <div className="d-flex ">
                    <span>{icon ?? <PDFIConNew />}</span>
                    {showDescription && (
                        <Link
                            href={file?.file || "javascript:void(0)"}
                            className="text-decoration-none d-flex flex-column tb-body-default-medium text-centerm w-100  text-muted"
                        >
                            <span className="mb-0 pb-0 truncate-1">
                                {file?.originalFileName ||
                                    file?.certificate?.originalFileName ||
                                    (file && Array.isArray(file) && file[0]?.name) ||
                                    file}
                            </span>
                            {file?.length > 0 && (
                                <span className="m-0 p-0">
                                    {(file[0]?.size / sizeInMB).toFixed(2)}
                                    {"mb"}
                                </span>
                            )}
                        </Link>
                    )}
                </div>
            </div>
            {onDelete && canRemoveFile && (
                <>
                    <Button
                        variant="default"
                        className="border-0 bg-gray-100 btn p-1  d-flex align-items-center justify-content-center rounded-circle w-24 h-24"
                        onClick={() => onDelete(file)}
                    >
                        {deleteIcon}
                        <X size={16} color="#454545" />
                    </Button>
                </>
            )}
        </div>
    );
}
