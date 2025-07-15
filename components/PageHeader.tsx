import { Microphone2, SearchNormal1 } from "iconsax-react";
import Header from "./Header";

export default function PageHeader(props: any) {
    return (
        <div className="page-header d-flex">
            <div className="search-box">
                <div>
                    <SearchNormal1 size="16" color="#888888" />
                    <input type="text" placeholder={props.searchPlaceholder} />
                </div>
                <Microphone2 size="24" color="#6D6D6D" />
            </div>
            <Header buttonText="New Link" buttonUrl="/links/add" />
        </div>
    );
}
