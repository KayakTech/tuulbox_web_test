import {
    Bill,
    Bookmark,
    CardPos,
    ClipboardTick,
    DocumentText,
    Gallery,
    MenuBoard,
    Message,
    Messages2,
    Note,
    Receipt1,
    Refresh,
    StatusUp,
    Stickynote,
    Triangle,
} from "iconsax-react";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";

type CustomMenuItemState = {
    menuName: string;
    className?: string;
    onClick?: () => void;
    menu: ProjectDocumentMenuItem;
};
export default function CustomMenuItem(props: CustomMenuItemState) {
    const { menuName, className, onClick, menu } = props;

    function icon() {
        if (menuName.toLowerCase() === "project details") return <DocumentText size={16} />;
        if (menuName.toLowerCase() === "emails") return <Message size={16} />;
        if (menuName.toLowerCase() === "chat") return <Messages2 size={16} />;
        if (menuName.toLowerCase() === "subcontractor") return <StatusUp size={16} />;
        if (menuName.toLowerCase() === "plans & elevation") return <Triangle size={16} />;
        if (menuName.toLowerCase() === "permits") return <ClipboardTick size={16} />;
        if (menuName.toLowerCase() === "estimates") return <Receipt1 size={16} />;
        if (menuName.toLowerCase() === "contracts") return <Stickynote size={16} />;
        if (menuName.toLowerCase() === "change orders") return <Refresh size={16} />;
        if (menuName.toLowerCase() === "specifications") return <Bill size={16} />;
        if (menuName.toLowerCase() === "additional documents") return <MenuBoard size={16} />;
        if (menuName.toLowerCase() === "photos") return <Gallery size={16} />;
        if (menuName.toLowerCase() === "performance schedule") return <Note size={16} />;
    }

    return (
        <div onClick={onClick} className={`custom-sub-menu-item d-flex gap-2 ${className}`}>
            {menu.icon && <menu.icon size={16} />}
            {menuName}
        </div>
    );
}
