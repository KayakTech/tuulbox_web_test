import { Contact } from "@/repositories/contact-repositories";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import DI from "@/di-container";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useDebounce from "./debountce";
import { useDispatch } from "react-redux";
import { searchActions } from "@/store/search-reducer";
import { GLOBAL_SEARCH_PAGES, SEARCH_MODULES, SearchModule } from "@/helpers/constants";
import { AddQueryToUrl, currentPage, getUrlQuery, updateUrlQuery } from "@/helpers";

const useSearchForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [searchType, setSearchType] = useState<SearchModule | null>(null);
    const { searchResults, showDropdown } = useSelector((state: RootState) => state.searchResults);
    const [searchTerm, setSearchTerm] = useState<any>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState<string>("");
    const formRef = useRef<HTMLFormElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null); // Explicitly set the type

    const recognitionRef = useRef<null | InstanceType<typeof SpeechRecognition>>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (!searchTerm) {
            dispatch(searchActions.setShowDropdown(false));
        }

        const category = getUrlQuery("search-category");

        if (searchTerm?.length >= 2 && GLOBAL_SEARCH_PAGES.includes(`/${currentPage()}`)) {
            router.push(`/search?query=${searchTerm}${category ? "&search-category=" + category : ""}`);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const query = getUrlQuery("query");
        const category = getUrlQuery("search-category");

        if (query) {
            setSearchTerm(query);
        }
        if (category) {
            // @ts-ignore
            setSearchType(SEARCH_MODULES.find(module => module.category === category));
        }

        // query && search(payload);
    }, [router]);

    // useEffect(() => {
    //     setSearchTerm(transcript);
    // }, [transcript]);

    function initSpeechToText() {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || window.SpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = "en-US"; // Set the language
                recognition.interimResults = false; // Use interim results if you want live feedback
                recognition.maxAlternatives = 1; // The number of results returned per speech recognition event

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    const result = event.results[0][0].transcript;
                    setTranscript(result); // Save result to state
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error:", event);
                };

                recognition.onend = () => {
                    // When speech recognition ends, reset the listening state
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            } else {
                console.warn("SpeechRecognition API not supported in this browser.");
            }
        }
    }

    useEffect(() => {
        setSearchTerm(transcript);
    }, [transcript]);

    async function search(payload: { query: string; categories?: string[] }) {
        setIsSearching(true);
        setIsLoading(true);
        dispatch(searchActions.setShowDropdown(false));

        try {
            const res = await DI.searchService.search(payload);
            dispatch(searchActions.setSearchResults(res.data));
        } catch (error) {
            //
        } finally {
            setIsSearching(false);
            setIsLoading(false);
        }
    }

    function onSearchTypeSelected(module: SearchModule) {
        setSearchType(module);
        dispatch(searchActions.setShowDropdown(false));
        formRef.current?.focus();

        if (searchTerm) {
            router.push(`/search?query=${searchTerm}&search-category=${module.category}`);

            // search({ query: searchTerm, categories: [module.category] });
        }
    }

    function onSearchInputFocus() {
        dispatch(searchActions.setShowDropdown(true));
    }
    function onSearchInputBlur() {
        dispatch(searchActions.setShowDropdown(false));
    }

    function onSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(e.target.value);
    }

    const handleOutsideClick = (event: MouseEvent) => {
        // dispatch(searchActions.setShowDropdown(false));

        if (formRef.current && !formRef?.current?.contains(event.target as Node)) {
            dispatch(searchActions.setShowDropdown(false));
        }
    };

    function resetSearchResults() {
        dispatch(searchActions.resetSearchResults());
    }

    function contactDetails(contact: Partial<Contact>) {
        dispatch(searchActions.setShowModal(false));
        router.push(`/contacts/${contact.id}`);
    }

    function handleGlobalSearch(e: React.FormEvent) {
        e.preventDefault();
        router.push(`/search?query=${searchTerm}&search-category=${searchType ? searchType.category : ""}`);
    }

    function removeSearchCategory() {
        setSearchType(null);
        if (searchTerm) {
            router.push(`/search?query=${searchTerm}`);
            // search({ query: searchTerm });
        }
    }

    function toggleSpeechToText() {
        if (recognitionRef.current) {
            if (isListening) {
                recognitionRef.current.stop(); // Stop recognition
                setIsListening(false);
            } else {
                recognitionRef.current.start(); // Start recognition
                setIsListening(true);
            }
        }

        // isListening ? stopListening() : startListening();
        // setIsListening(!isListening);
    }
    const tableColumns = () => {
        return [
            {
                name: <span className="text-gray-400 tb-body-title-caps">Full Name</span>,
                cell: (row: Partial<Contact>) => (
                    <div className="text-muted  text-capitalize d-flex align-items-center">
                        <span className="bg-light rounded-circle d-flex me-2" style={{ width: "40px", height: "40px" }}>
                            <Image
                                className="m-auto"
                                src={`/images/svg/icons/user-grey.svg`}
                                alt=""
                                width={16}
                                height={16}
                            />
                        </span>
                        <span className=" d-flex flex-column">
                            <span className="text-black">{`${row.fullName}`}</span>
                            {row.isSubcontractor ? <span className="small">Sub-Contractor</span> : null}
                        </span>
                    </div>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Mobile Number</span>,
                cell: (row: Partial<Contact>) => (
                    <span className="text-muted ">
                        {row.phoneNumber ? (
                            <a className="text-decoration-none text-muted" href={`tel:${row.phoneNumber}`}>
                                {row.phoneNumber}
                            </a>
                        ) : (
                            "-"
                        )}
                    </span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Email</span>,
                cell: (row: Partial<Contact>) => (
                    <span className="text-muted ">{row?.email?.toLowerCase() || "-"}</span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Company</span>,
                cell: (row: Partial<Contact>) => <span className="text-muted ">{row.company || "-"}</span>,
                grow: 3,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Actions</span>,
                grow: 2,
                cell: (row: Partial<Contact>, index: number) => (
                    <div className="d-flex flex-row flex-nowrap">
                        <a href="javascript:void(0)" onClick={() => contactDetails(row)}>
                            View Details
                        </a>
                    </div>
                ),
            },
        ];
    };

    function onMicrophoneClick() {
        inputRef.current?.focus();
        toggleSpeechToText();
    }

    return {
        searchType,
        setSearchType,
        searchTerm,
        setSearchTerm,
        tableColumns,
        searchResults,
        resetSearchResults,
        isLoading,
        setIsLoading,
        handleGlobalSearch,
        search,
        isSearching,
        setIsSearching,
        formRef,
        onSearchTypeSelected,
        onSearchInputFocus,
        handleOutsideClick,
        toggleSpeechToText,
        isListening,
        setIsListening,
        initSpeechToText,
        transcript,
        removeSearchCategory,
        inputRef,
        onMicrophoneClick,
    };
};

export default useSearchForm;
