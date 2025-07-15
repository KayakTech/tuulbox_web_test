import BreadCrumbs from "@/components/BreadCrumbs";
import { Archive, ArrowLeft, Send, Trash } from "iconsax-react";
import { SetStateAction } from "react";
import { Button, FormControl, InputGroup } from "react-bootstrap";
import { Plus } from "react-feather";

export default function NewChat() {
    return (
        <section className="">
            <div className="border-0 border-gray-100 border-bottom px-32 py-2">
                <BreadCrumbs crumbs={[{ name: "Chat", url: "/chats" }]} />
            </div>
            <div className="d-flex flex-column h-80vh gap-5 justify-content-between">
                <div className="d-flex align-items-center gap-3 py-12 border-bottom border-gray-100 px-32">
                    <div>
                        <ArrowLeft size="24" className="stroke-gray-700" />
                    </div>
                    <div className="d-flex align-items-center w-100 gap-3">
                        <div className="rounded-circle text-gray-300 h-48 w-48 bg-gray-50 p-2 d-flex align-items-center justify-content-center">
                            <span className="tb-title-subsection-medium">S</span>
                        </div>
                        <div className="d-flex justify-content-between w-100">
                            <div>
                                <p className="m-0 tb-body-default-medium">stella</p>
                                <p className="m-0 tb-body-small-regular">stella@gmail.com</p>
                            </div>
                            <div className="d-flex gap-4">
                                <Archive size="24" className="stroke-gray-500" />
                                <Trash size="24" className="stroke-gray-500" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center px-32 justify-content-center w-100">
                    <div className="message-input-container w-100 px-3 py-12">
                        <InputGroup className="align-items-centerm d-flex flex-column">
                            <FormControl
                                placeholder="Type your message here"
                                className="border-0 outline-none w-100 shadow-none"
                            />
                            <div className="d-flex align-items-center justify-content-between">
                                <span className="input-add bg-gray-50 d-flex align-items-center rounded-circle justify-content-center border-0">
                                    <Plus className="text-muted" size={20} />
                                </span>
                                <Button variant="primary" disabled className="d-flex align-items-center">
                                    Send <Send className="ms-2" />
                                </Button>
                            </div>
                        </InputGroup>
                    </div>
                </div>
            </div>
        </section>
    );
}
