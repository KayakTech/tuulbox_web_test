import { Modal } from "react-bootstrap";
import SearchForm from "./SearchForm";
import SearchResults from "./SearchResults";
import useSearchForm from "@/hooks/searchForm";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type SearchModalProps = {
    showModal: boolean;
    setShowModal: (data: boolean) => void;
};

export default function SearchModal(props: SearchModalProps) {
    const { showModal, setShowModal } = props;
    const { searchResults } = useSelector((state: RootState) => state.searchResults);

    const { resetSearchResults } = useSearchForm();

    return (
        <Modal
            size="xl"
            show={showModal}
            onHide={() => setShowModal(false)}
            aria-labelledby="example-modal-sizes-title-sm sss"
            scrollable
            contentClassName="min-vh-45"
            onShow={resetSearchResults}
        >
            <Modal.Header>
                <SearchForm />
            </Modal.Header>
            <Modal.Body></Modal.Body>
        </Modal>
    );
}
