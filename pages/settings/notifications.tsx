import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card } from "react-bootstrap";
import SettingsMenu from "@/components/SettingsMenu";
import SettingsToggler from "@/components/SettingsToggler";
import useSettings from "@/hooks/settings";

export default function Notifications() {
    const { TOGGLE_SETTINGS, handleToggleSetting, extractPreference, allChecked } = useSettings();

    return (
        <div className="overflow-hidden">
            <DashboardLayout breadCrumbs={[{ name: "Settings", url: "/settings" }]} pageTitle="Settings">
                <div className="mt-4">
                    <SettingsMenu />

                    <div className="px-48 d-flex align-items-center justify-content-center profile-card-padding">
                        <Card className="mx-md-5 mobile-mt mt-5 mb-40 w-100">
                            <Card.Header className="header bg-transparent">
                                <Card.Title className="">Manage notifications</Card.Title>
                            </Card.Header>
                            <Card.Body className="d-flex flex-column gap-3 px-3">
                                <div className="mt-3 d-flex flex-column gap-4">
                                    <h6 className="mb-3 color-# tb-body-title-caps">NOTIFY ME ABOUT</h6>

                                    {TOGGLE_SETTINGS.map((setting, index) => (
                                        <SettingsToggler
                                            id={setting.slug}
                                            preference={extractPreference(setting)}
                                            title={setting.title}
                                            description={setting.description}
                                            key={index + setting.title}
                                            onToggle={e => handleToggleSetting(e, setting)}
                                            index={index}
                                            toggles={TOGGLE_SETTINGS}
                                            allChecked={allChecked()}
                                        />
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </div>
    );
}
