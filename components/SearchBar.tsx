import useSearchForm from "@/hooks/searchForm";
import { Microphone2, SearchNormal1 } from "iconsax-react";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Form, InputGroup, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AddQueryToUrl, getUrlQuery, isMobileDevice, isTabletDevice, removeQueryFromUrl } from "@/helpers";
import { searchActions } from "@/store/search-reducer";
import { RootState } from "@/store";

type SearchProps = {
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

const SearchBar = (props: SearchProps) => {
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
    } = props;

    const router = useRouter();
    const dispatch = useDispatch();
    const { showModal } = useSelector((state: RootState) => state.searchResults);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { toggleSpeechToText, transcript, isListening, setIsListening, initSpeechToText } = useSearchForm();

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
        <Form className="search-form  h-100 w-100" onSubmit={handleSearch}>
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
                        <Microphone2 size="24" variant="Bold" color={isListening ? "#E70000" : "#6D6D6D"} />
                    )}
                </InputGroup.Text>
            </InputGroup>
        </Form>
    );
};

export default SearchBar;
