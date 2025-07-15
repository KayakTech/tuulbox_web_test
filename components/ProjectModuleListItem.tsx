import { User } from "iconsax-react";
import { Form } from "react-bootstrap";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type ProjectModuleListItemProps = {
    menu: ProjectDocumentMenuItem;
    selectAll: boolean;
    selectedModules: string[];
    onSelected: (menu: ProjectDocumentMenuItem) => void;
};

export default function ProjectModuleListItem({
    menu,
    selectAll,
    selectedModules,
    onSelected,
}: ProjectModuleListItemProps) {
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);

    function handleOnclick() {
        const element = document.getElementById(`checkbox-${menu.category}`) as HTMLInputElement | null;
        element && element.click();
    }

    function handleSelected() {
        onSelected(menu);
    }

    return listOrGrid.projectShare === "grid" ? (
        <div className="d-flex flex-column align-items-center pointer" onClick={handleSelected}>
            <div
                className={`h-66 w-66 rounded-circle border-2 border-solid ${
                    selectedModules.includes(menu.category) ? "border-blue-100 " : "border-white"
                }`}
            >
                <div
                    className={`bg-gray-50 h-64 w-64 rounded-circle d-flex justify-content-center align-items-center border-2 border-solid ${
                        selectedModules.includes(menu.category) ? "border-primary border-2 border" : "border-white"
                    }`}
                >
                    <menu.icon size={40} color="rgba(136, 136, 136, 1)" />
                </div>
            </div>
            <p className="m-0 text-center text-muted tb-body-default-medium mt-2">{menu.name}</p>
        </div>
    ) : (
        <div
            className="border border-gray-50 border-radius-12 p-16 d-flex align-items-center pointer"
            onClick={handleSelected}
        >
            <div className="d-flex flex-grow-1 align-items-center gap-3">
                <div className="w-40 h-40 bg-gray-50 border-gray-100 border-radius-8 d-flex justify-content-center align-items-center">
                    {menu.icon && <menu.icon size={16} color="rgba(93, 93, 93, 1)" />}
                </div>
                <p className="m-0 text-gray-600 fw-500 fs-16">{menu.name}</p>
            </div>
            <Form.Check
                className="module-checkbox"
                id={`checkbox-${menu.category}`}
                checked={selectedModules.includes(menu.category)}
                onClick={e => {
                    e.stopPropagation();
                }}
                onChange={handleSelected}
            />
        </div>
    );
}
