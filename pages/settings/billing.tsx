import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Button, Form, Offcanvas, InputGroup, ListGroup } from "react-bootstrap";
import { Iconly } from "react-iconly";
import { UserSquare, Notification, EmptyWallet, Messages2, DocumentText } from "iconsax-react";
import Required from "@/components/Required";
import Image from "next/image";
import UploadImgModal from "@/components/ProfileImageModal";
import SettingsMenu from "@/components/SettingsMenu";
import { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import PlansAndPricing from "@/components/PlansAndPricing";
import UserManagement from "@/components/UserManagement";
import BillingHistory from "@/components/BillingHistory";
import BillingContact from "@/components/BillingContact";
interface CustomTabsProps {
    activeKey: string;
    setActiveKey: (key: string) => void;
}
export default function Billing() {
    const [activeKey, setActiveKey] = useState<string>("Plans");
    return (
        <div className="overflow-hidden">
            <DashboardLayout
                breadCrumbs={[{ name: "Settings", url: "/settings" }, { name: "Notifications" }]}
                pageTitle="Settings"
            >
                <div className="container-fluid mt-4">
                    <SettingsMenu />

                    <section className="mt-4">
                        <div className="d-flex flex-column gap-3 ">
                            <span className=" border-bottom border-gray-100">
                                <h3 className="tb-title-subsection-medium text-gray-900">Billing & subscription</h3>
                                <p className="tb-body-large-regular text-gray-400">
                                    Easily manage your subscription plans and billing history
                                </p>
                            </span>
                            <div className="border-0 d-flex flex-column ">
                                <CustomTabs activeKey={activeKey} setActiveKey={setActiveKey} />
                            </div>
                        </div>
                    </section>
                </div>
            </DashboardLayout>
        </div>
    );
}

const CustomTabs: React.FC<CustomTabsProps> = ({ activeKey, setActiveKey }) => {
    const tabContentMap: Record<string, React.ReactNode> = {
        Plans: <PlansAndPricing />,
        History: <BillingHistory />,
        Collaborators: <UserManagement />,
        Billing: <BillingContact />,
    };

    const renderTabContent = (): React.ReactNode => {
        return tabContentMap[activeKey] || <div>Select a tab to see content.</div>;
    };
    return (
        <>
            <Tabs
                id="controlled-tab-example"
                activeKey={activeKey}
                onSelect={k => setActiveKey(k || "Plans")}
                className="shadcn-tabs bg-gray-50 p-1 border-radius-12 border-0 w-600"
            >
                <Tab eventKey="Plans" title="Plans & Pricing" tabClassName="shadcn-tab" />
                <Tab eventKey="History" title="Billing History" tabClassName="shadcn-tab" />
                <Tab eventKey="Billing" title="Billing Contact" tabClassName="shadcn-tab" />
                <Tab eventKey="Collaborators" title="Collaborators" tabClassName="shadcn-tab" />
            </Tabs>

            <div className="tab-content-wrapper mt-3">{renderTabContent()}</div>
        </>
    );
};
