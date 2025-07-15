import { Row, Col, Button, Form, InputGroup, Nav, Spinner } from "react-bootstrap";
import Link from "next/link";
import { Plus } from "react-feather";
import { Microphone2, SearchNormal1 } from "iconsax-react";
import SearchModal from "./SearchModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { searchActions } from "@/store/search-reducer";
import { useDispatch } from "react-redux";
import ListOrGrid from "./ListOrGrid";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AddQueryToUrl, getUrlQuery, isMobileDevice, isTabletDevice, removeQueryFromUrl } from "@/helpers";
import { useRouter } from "next/router";
import useSearchForm from "@/hooks/searchForm";

type HeaderProps = {
    showActions?: boolean;
    buttonText?: string;
    secondaryButtonText?: string;
    buttonUrl?: string;
    secondaryButtonUrl?: string;
    headerText?: string;
    searchPlaceholder?: string;
    showListOrGrid?: boolean;
    showSearchForm?: boolean;
    className?: string;
    onButtonClick?: () => void;
    onSecondaryButtonClick?: () => void;
    hideContainerClass?: boolean;
    showBottomBorder?: boolean;
    listOrGridKey?: string;
    onSearch?: (searchTerm: string) => void;
    onClearSearch?: () => void;
    isSearching?: boolean;
    secondaryButtonIcon?: any;
    noHieght?: boolean;
    fixedTop?: boolean;
};

export default function Header(props: HeaderProps) {
    const {
        buttonText,
        buttonUrl,
        headerText,
        searchPlaceholder,
        showListOrGrid = true,
        showSearchForm = true,
        className = "",
        onButtonClick,
        hideContainerClass = false,
        showBottomBorder = true,
        listOrGridKey,
        onSearch,
        onClearSearch,
        isSearching,
        secondaryButtonText,
        secondaryButtonUrl,
        onSecondaryButtonClick,
        secondaryButtonIcon,
        noHieght = false,
        fixedTop = true,
        showActions = true,
    } = props;
    const router = useRouter();
    const dispatch = useDispatch();
    const { showModal } = useSelector((state: RootState) => state.searchResults);
    const { toggleSpeechToText, transcript, isListening, setIsListening, initSpeechToText } = useSearchForm();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | null>(null); // Explicitly set the type

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        if (searchTerm) {
            AddQueryToUrl(searchTerm);
            onSearch && onSearch(searchTerm);
        }
    }

    function onSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        if (!value) {
            removeQueryFromUrl("query");
            dispatch(searchActions.resetSearchResults());
            onClearSearch && onClearSearch();
        }
        setSearchTerm(value);
    }

    useEffect(() => {
        initSpeechToText();
        // const query = getUrlQuery("query");
        // if (query) {
        //     setSearchTerm(query);
        // }
    }, []);

    useEffect(() => {
        const query = getUrlQuery("query");
        if (query) {
            setSearchTerm(query);
        } else {
            setSearchTerm("");
        }
    }, [router]);

    useEffect(() => {
        if (transcript) {
            setSearchTerm(transcript);
            AddQueryToUrl(transcript);
            onSearch && onSearch(transcript);
        }
    }, [transcript]);

    function onMicrophoneClick() {
        toggleSpeechToText();
        inputRef?.current?.focus();
    }

    return (
        <div
            className={`${!hideContainerClass ? "px-32" : ""} ${
                noHieght ? "" : "h-92"
            } align-items-center header-height d-flex bg-white ${showBottomBorder ? "border-bottom-gray-100" : ""} ${
                fixedTop ? "header-fixed-top" : ""
            } ${className}`}
        >
            <Row
                className={`${className} ${
                    noHieght ? "" : "my-12"
                } g-0 align-items-center justify-content-between w-100 d-flex`}
            >
                <Col xs={10} md={6}>
                    {headerText && <p className="m-0 text-gray-700 tb-title-body-medium">{headerText}</p>}
                    {showSearchForm && (
                        <Form className="search-form h-100" onSubmit={handleSearch}>
                            <InputGroup className="h-100">
                                <InputGroup.Text className="outline-none">
                                    <SearchNormal1 size="16" color="#888888" />
                                </InputGroup.Text>
                                <Form.Control
                                    ref={inputRef}
                                    className="w-100 active"
                                    type="search"
                                    value={searchTerm}
                                    placeholder={searchPlaceholder}
                                    onChange={onSearchInputChange}
                                    aria-label="Search"
                                    style={{ boxShadow: "none" }}
                                    required
                                />
                                <InputGroup.Text className="ps-0 pointer" onClick={onMicrophoneClick}>
                                    {isSearching ? (
                                        <Spinner size="sm" />
                                    ) : (
                                        <Microphone2
                                            size="24"
                                            variant="Bold"
                                            color={isListening ? "#E70000" : "#6D6D6D"}
                                        />
                                    )}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form>
                    )}
                </Col>

                {(showListOrGrid || secondaryButtonText || buttonText) && (
                    <Col xs={2} md={6}>
                        <div className="d-flex align-items-center float-end gap-4">
                            {showListOrGrid && !isMobileDevice() && <ListOrGrid layoutKey={listOrGridKey} />}
                            {secondaryButtonText && (
                                <>
                                    {secondaryButtonUrl ? (
                                        <span className="text-decoration-none float-end margin-0">
                                            <Button
                                                href={secondaryButtonUrl}
                                                variant="outline-secondary"
                                                className="btn-md d-flex gap-2 rounded-3 align-items-center text-primary tb-title-body-medium"
                                            >
                                                {secondaryButtonIcon ?? null} {secondaryButtonText}
                                            </Button>
                                        </span>
                                    ) : (
                                        <Button
                                            variant="outline-secondary"
                                            className="btn-md d-flex align-items-center gap-2 text-primary tb-title-body-medium"
                                            onClick={onSecondaryButtonClick}
                                        >
                                            {secondaryButtonIcon ?? null} {secondaryButtonText}
                                        </Button>
                                    )}
                                </>
                            )}
                            {buttonText && (
                                <>
                                    {buttonUrl ? (
                                        <span className="text-decoration-none float-end margin-0">
                                            <Button
                                                href={buttonUrl}
                                                variant="outline-secondary"
                                                className="btn-md d-flex gap-2 align-items-center text-primary tb-title-body-medium"
                                            >
                                                <Plus size={20} />{" "}
                                                {!isMobileDevice() && !isTabletDevice() && buttonText}
                                            </Button>
                                        </span>
                                    ) : (
                                        <div>
                                            <Button
                                                variant="outline-secondary"
                                                className="btn-md d-flex d-lg-flex d-xl-flex d-xxl-flex d-md-none align-items-center gap-2 text-primary tb-title-body-medium"
                                                onClick={onButtonClick}
                                            >
                                                <Plus size={20} />{" "}
                                                {!isMobileDevice() && !isTabletDevice() && buttonText}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Col>
                )}
            </Row>
            <SearchModal showModal={showModal} setShowModal={data => dispatch(searchActions.setShowModal(data))} />
        </div>
    );
}
