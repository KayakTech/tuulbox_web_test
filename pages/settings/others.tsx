import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Button, Form, Offcanvas, InputGroup, ListGroup } from "react-bootstrap";
import { Iconly } from "react-iconly";
import { UserSquare, Notification, EmptyWallet, Messages2, DocumentText } from "iconsax-react";
import Required from "@/components/Required";
import Image from "next/image";
import { useReducer, useState } from "react";
import UploadImgModal from "@/components/ProfileImageModal";
import SettingsMenu from "@/components/SettingsMenu";
import OthersList from "@/components/OthersList";
import DeleteButton from "@/components/DeleteButton";

export default function Terms() {
    return (
        <div className="overflow-hidden">
            <DashboardLayout breadCrumbs={[{ name: "Settings", url: "/settings" }]} pageTitle="Settings">
                <div className="mt-4">
                    <SettingsMenu />
                    <div className="d-flex px-48 profile-card-padding">
                        <OthersList />
                    </div>
                </div>
            </DashboardLayout>
        </div>
    );
}
