import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";
import ProjectCard from "@/components/ProjectCard";
import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { Iconly } from "react-iconly";
import Link from "next/link";
import { Project, ProjectDocumentCategories } from "@/repositories/project-repository";
import DI from "@/di-container";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useProject from "@/hooks/project";
import DataTable from "react-data-table-component";
import resources from "../links";
import ListOrGrid from "@/components/ListOrGrid";
import EngineerAndLaptop from "@/components/icons/EngineerAndLaptop";
import DeleteModal from "@/components/DeleteModal";
import { DATA_TABLE_CUSTOM_STYLES } from "@/helpers/constants";
import ShareProjectModal from "@/components/ShareProjectModal";
import useContact from "@/hooks/useContact";
import ProjectShareSuccessModal from "@/components/ProjectShareSuccessModal";
import useSearchForm from "@/hooks/searchForm";
import { getUrlQuery } from "@/helpers";
import InfiniteScroll from "react-infinite-scroll-component";
import { SearchNormal1 } from "iconsax-react";
import DataTableComponent from "@/components/DataTableComponent";
import { MyToast } from "@/components/MyToast";
import ProjectsComponent from "@/components/ProjectsComponent";

export default function ArchivedProjects() {
    return <ProjectsComponent status="archived" />;
}
