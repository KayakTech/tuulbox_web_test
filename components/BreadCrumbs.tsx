import { useRouter } from "next/router";
import { Breadcrumb } from "react-bootstrap";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type BreadCrumbsState = {
    crumbs: Crumb[];
    className?: string;
    showArrow?: boolean;
    useRootFontSize?: boolean;
    breadCrumbItemClassName?: string;
};
export type Crumb = {
    name: string;
    url?: string;
};
export default function BreadCrumbs(props: BreadCrumbsState) {
    const router = useRouter();
    const { crumbs, className, showArrow = true, useRootFontSize = true, breadCrumbItemClassName } = props;

    return (
        <Breadcrumb className={`text-decoration-none ${className}`}>
            {crumbs?.map((crumb, index) => (
                <Breadcrumb.Item
                    key={index}
                    className={`m-0 py-3m crumbs-padding ${
                        index === crumbs.length - 1 ? "text-black" : "text-muted"
                    } ${breadCrumbItemClassName}`}
                    href={crumb.url}
                    active={index === crumbs.length - 1 && index != 0}
                >
                    {crumb.name}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
}
