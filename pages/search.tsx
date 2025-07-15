import DashboardLayout from "@/components/DashboardLayout";
import { Col, Card, Button, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";
import useSearchForm from "@/hooks/searchForm";
import { CONTACT_MOCK } from "@/mock/contact";
import { ArrowRight2, DocumentText, ArrowDown, Link1, ExportCircle } from "iconsax-react";
import MessageItem, { MessageType } from "@/components/MessageItem";
import MessageItemSearched from "@/components/MessageItemSearched";
import SearchResults from "@/components/SearchResults";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PageLoader from "@/components/PageLoader";
import { searchActions } from "@/store/search-reducer";
import EmptyState from "@/components/EmptyState";
import { Iconly } from "react-iconly";
import { SearchNormal1 } from "iconsax-react";
import useResource from "@/hooks/useResources";
import { getUrlQuery, searchResultHasData } from "@/helpers";
import { SEARCH_MODULES } from "@/helpers/constants";

export default function Search(p0: { query: string; categories: string[] }) {
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { isLoading, searchType, setSearchType, search, setSearchTerm, isSearching } = useSearchForm();
    const router = useRouter();
    const dispatch = useDispatch();
    const { type, q } = router.query;

    useEffect(() => {
        let payload: any = {};
        const query = getUrlQuery("query");
        const category = getUrlQuery("search-category");
        if (query) {
            setSearchTerm(query);
            payload.query = query;
        }
        if (category) {
            // @ts-ignore
            setSearchType(SEARCH_MODULES.find(module => module.category === category));
            payload.categories = category ? [category] : null;
        }
        query && search(payload);
    }, [router]);

    return (
        <DashboardLayout breadCrumbs={[{ name: "Search" }]} pageTitle="Search">
            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="mt-4">
                    {searchResults && searchResultHasData(searchResults) ? (
                        Object.keys(searchResults).map(key =>
                            // @ts-ignore
                            searchResults[key].results.length > 0 ? (
                                <SearchResults
                                    key={key}
                                    // @ts-ignore
                                    count={searchResults[key].count}
                                    searchType={key}
                                    // @ts-ignore
                                    searchResult={searchResults[key].results.slice(0, 2)}
                                />
                            ) : null,
                        )
                    ) : (
                        <EmptyState
                            icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                            headerText={`No Results Found`}
                            descriptionText={`"${getUrlQuery("query")}" did not match any data. Please try again.`}
                        />
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
