import { Link, Calendar, Briefcase, People, DocumentText, Messages3 } from "iconsax-react";
import { X } from "react-feather";

type SearchTagProps = {
    searchType: string;
    remove: () => void;
};
export default function SearchTypeTag(props: SearchTagProps) {
    const { searchType, remove } = props;

    return (
        <div className="d-flex align-items-center justify-content-center search-form-tag">
            {searchType.toLowerCase() === "contacts" && <People variant="Linear" size={16} color="grey" />}
            {searchType.toLowerCase() === "storage" && <DocumentText variant="Linear" size={16} color="grey" />}
            {searchType.toLowerCase() === "links & resources" && <Link variant="Linear" size={16} color="grey" />}
            {searchType.toLowerCase() === "calendar" && <Calendar variant="Linear" size={16} color="grey" />}
            {searchType.toLowerCase() === "communications" && <Messages3 variant="Linear" size={16} color="grey" />}
            {searchType.toLowerCase() === "projects" && <Briefcase variant="Linear" size={16} color="grey" />}
            <span className="ms-2">{searchType}</span>
            <X size={16} className="ms-2 pointer" onClick={remove} />
        </div>
    );
}
