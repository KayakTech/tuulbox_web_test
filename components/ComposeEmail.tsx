import { Button, Col, Form, Row } from "react-bootstrap";
import FormLayout from "./FormLayout";
import YouAreSignedInAs from "./YouAreSignedInAs";
import { useReducer, useState } from "react";
import ButtonLoader from "./ButtonLoader";
import FormErrorMessage from "./FormErrorMessage";
import CreatableSelect from "react-select/creatable";
import { TagInput } from "./ResourceForm";
import { Email } from "@/repositories/communications-repository";
import Required from "./Required";

type ComposeEmailState = {
    onViewEmailList: () => void;
    viewEmailList: () => void;
    integratedEmail: string;
    projectId: string;
    isSubmitting: boolean;
    sendEmail: (email: Email) => Promise<boolean>;
};

const SAMPLE_EMAIL_SUGGESTIONS = [
    { value: "abc@email.com", label: "abc@email.com" },
    { value: "123@email.com", label: "123@email.com" },
];

export default function ComposeEmail(props: ComposeEmailState) {
    const { onViewEmailList, viewEmailList, integratedEmail, projectId, isSubmitting, sendEmail } = props;
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [emailSuggestions, setEmailSuggestions] = useState<TagInput[]>(SAMPLE_EMAIL_SUGGESTIONS);

    const [email, setEmail] = useReducer((state: any, newState: Partial<Email>) => ({ ...state, ...newState }), {
        to: [],
        cc: [],
        subject: "",
        content: "",
        project: projectId,
    });

    function handleTo(newTags: any) {
        if (newTags) {
            setEmail({
                to: [newTags.value],
            });
        }
        if (!newTags) {
            setEmail({
                to: [],
            });
        }
    }

    function handleCc(newTags: any) {
        setEmail({
            cc: newTags.map((tag: TagInput) => {
                return tag.value;
            }),
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.to) return;
        if (!email.subject) return;
        if (!email.content) return;

        const res = await sendEmail(email);
        if (res) viewEmailList();
    }
    return (
        <>
            {integratedEmail && <YouAreSignedInAs email={integratedEmail} className="" />}
            <FormLayout>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4 form-group">
                        <Form.Label>
                            Send to <Required />{" "}
                        </Form.Label>
                        <CreatableSelect
                            isClearable
                            options={emailSuggestions}
                            openMenuOnFocus={true}
                            onChange={handleTo}
                            noOptionsMessage={() => "No contact found"}
                            placeholder="E.g Peter Parker"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label>Cc</Form.Label>
                        <CreatableSelect
                            isMulti
                            isClearable
                            options={emailSuggestions}
                            openMenuOnFocus={true}
                            onChange={handleCc}
                            noOptionsMessage={() => "No contact found"}
                            placeholder="E.g jon@mail.com"
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label>
                            Subject <Required />{" "}
                        </Form.Label>
                        <Form.Control
                            value={email.subject}
                            onChange={e => setEmail({ subject: e.target.value })}
                            placeholder="E.g Provide a cool subject"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label>
                            Messages <Required />
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            className="h-100"
                            rows={3}
                            placeholder="E.g Provide a cool subject"
                            value={email.content}
                            onChange={e => setEmail({ content: e.target.value })}
                            required
                        />
                    </Form.Group>

                    <div className="mt-4">
                        {errorMessage && <FormErrorMessage message={errorMessage} />}
                        <Row className="g-2">
                            <Col md={5}>
                                <Button className="w-100" variant="outline-secondary" onClick={onViewEmailList}>
                                    Cancel
                                </Button>
                            </Col>
                            <Col md={7}>
                                <Button className="w-100" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <ButtonLoader buttonText={"Sending"} /> : "Send Email"}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </FormLayout>
        </>
    );
}
