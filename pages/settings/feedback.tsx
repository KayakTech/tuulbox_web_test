import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Button, Form, Offcanvas, InputGroup, ListGroup } from "react-bootstrap";
import { Iconly } from "react-iconly";
import { UserSquare, Notification, EmptyWallet, Messages2, DocumentText } from "iconsax-react";
import Required from "@/components/Required";
import Image from "next/image";
import { useReducer, useState } from "react";
import UploadImgModal from "@/components/ProfileImageModal";
import SettingsMenu from "@/components/SettingsMenu";

export default function Feedback() {
    return (
        <div className="overflow-hidden">
            <DashboardLayout
                breadCrumbs={[{ name: "Settings", url: "/settings" }, { name: "Notifications" }]}
                pageTitle="Settings"
            >
                <div className="container-fluid">
                    <SettingsMenu />

                    <h1>Feedback page in progress</h1>
                </div>
            </DashboardLayout>
        </div>
    );
}
