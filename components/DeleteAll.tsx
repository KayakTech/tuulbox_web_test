import { Share, Trash } from "iconsax-react";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Share2 } from "react-feather";

type DeleteAllProps = {
    onSelect: (value: boolean) => void;
    onSelectAll: (value: boolean) => void;
    onDeleteAll: () => void;
    onShare: () => void;
    selectedFiles: any[];
    hasSelectedAll: boolean;
};

export default function DeleteAll({
    onDeleteAll,
    onSelectAll,
    onShare,
    onSelect,
    selectedFiles,
    hasSelectedAll,
}: DeleteAllProps) {
    const [select, setSelect] = useState<boolean>(false);

    useEffect(() => {
        onSelect && onSelect(select);
    }, [select]);

    return (
        <div className="d-flex align-items-center justify-content-end">
            {!select ? (
                <p className="pointer tb-body-default-medium text-gray-800 m-0" onClick={() => setSelect(true)}>
                    Select
                </p>
            ) : (
                <span className="d-flex align-items-center gap-4">
                    <p className="pointer text-blue-800 tb-body-default-medium m-0" onClick={() => setSelect(false)}>
                        Cancel
                    </p>
                    <div className="border-end border-right-gray-100 h-24"></div>
                    <span>
                        <Form.Check
                            id="selectAll"
                            type="checkbox"
                            label="Select All"
                            className="d-flex gap-12 align-items-center text-gray-600 tb-body-default-medium pointer"
                            onChange={e => {
                                onSelectAll(e.target.checked);
                            }}
                            checked={hasSelectedAll}
                        />
                    </span>
                    <span className="d-flex align-items-center gap-3">
                        <Share2
                            size={16}
                            color={`${selectedFiles?.length ? "#4F4F4F" : "#E7E7E7"}`}
                            className={`${selectedFiles?.length ? "pointer" : ""}`}
                            onClick={() => selectedFiles?.length && onShare()}
                        />
                        <Trash
                            size={16}
                            color={`${selectedFiles?.length ? "#4F4F4F" : "#E7E7E7"}`}
                            className={`${selectedFiles?.length ? "pointer" : ""}`}
                            onClick={() => selectedFiles?.length && onDeleteAll()}
                        />
                    </span>
                </span>
            )}
        </div>
    );
}
