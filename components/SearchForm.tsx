import { Badge, Form, InputGroup, Spinner } from "react-bootstrap";
import {
    Link,
    Calendar,
    Briefcase,
    People,
    DocumentText,
    Messages3,
    SearchNormal1,
    Microphone2,
    Arrow,
    ArrowRight2,
} from "iconsax-react";
import { Iconly } from "react-iconly";
import useSearchForm from "@/hooks/searchForm";
import { useRef, useEffect } from "react";
import SearchTypeTag from "./SearchTypeTag";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { SearchActions, searchActions } from "@/store/search-reducer";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { SEARCH_MODULES, SearchModule } from "@/helpers/constants";

export default function SearchForm() {
    const dispatch = useDispatch();

    const {
        searchType,
        setSearchType,
        searchTerm,
        setSearchTerm,
        formRef,
        onSearchTypeSelected,
        onSearchInputFocus,
        handleOutsideClick,
        toggleSpeechToText,
        isListening,
        setIsListening,
        isSearching,
        handleGlobalSearch,
        initSpeechToText,
        removeSearchCategory,
        inputRef,
        onMicrophoneClick,
    } = useSearchForm();
    const { showDropdown } = useSelector((state: RootState) => state.searchResults);

    // hide dropdown on click outside
    useEffect(() => {
        initSpeechToText();
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    return (
        <Form onSubmit={handleGlobalSearch} className="search-form header me-auto" ref={formRef}>
            <InputGroup>
                <InputGroup.Text>
                    <SearchNormal1 size="16" color="#888888" />
                    {searchType && (
                        <Badge
                            bg="gray-50"
                            className="text-gray-900 ms-2 px-2 py-2 pointer d-flex align-items-center gap-1"
                            onClick={removeSearchCategory}
                        >
                            {searchType && searchType.icon && <searchType.icon size={16} />}{" "}
                            <span>{searchType.name}</span>
                        </Badge>
                    )}
                </InputGroup.Text>
                <Form.Control
                    ref={inputRef}
                    type="search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={"Search anything"}
                    aria-label="Search"
                    onFocus={onSearchInputFocus}
                    style={{ paddingLeft: `${searchType ? searchType?.inputPaddingLeft + "px" : "35px"}` }}
                />
                <InputGroup.Text className="pointer ps-0" onClick={onMicrophoneClick}>
                    {isSearching ? (
                        <Spinner size="sm" />
                    ) : (
                        <Microphone2 size="24" variant="Bold" color={isListening ? "#E70000" : "#6D6D6D"} />
                    )}
                </InputGroup.Text>
            </InputGroup>
            {showDropdown && (
                <div className="search-dropdown bg-white border-radius-12 shadow border-gray-100 mt-2 px-16 pb-12 position-absolute w-100 overflow-auto ">
                    <div className="text-gray-300 sticky-top bg-white py-3 m-0">
                        <small>I’m in search of:</small>
                    </div>
                    <ul className="list-unstyled">
                        {SEARCH_MODULES.map((module: SearchModule, index: number) => (
                            <li
                                className="dropdown-item gap-2 px-0 d-flex align-items-center"
                                key={module.category}
                                onClick={() => onSearchTypeSelected(module)}
                            >
                                <module.icon size={24} color="#5D5D5D" />
                                <span className="tb-title-body-medium text-gray-600 d-flex w-100 align-items-center justify-content-between">
                                    {module.name}
                                </span>
                                <ArrowRight2 size={12} color="#333333" />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Form>
    );
}
