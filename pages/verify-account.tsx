import React from "react";
import { Container, Button } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/router";

const VerificationPage: React.FC = () => {
    const router = useRouter();

    const handleBackToLogin = () => {
        router.push("/login");
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f9f9f9", display: "flex", flexDirection: "column" }}>
            <header style={{ padding: "20px", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
                <div style={{ position: "relative", height: "30px", width: "130px" }}>
                    <Image src="/images/logo.svg" alt="Logo" layout="fill" objectFit="contain" />
                </div>
            </header>

            <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-4">
                <div className="text-center" style={{ maxWidth: "480px" }}>
                    <div
                        className="mx-auto mb-4"
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            backgroundColor: "#EBF8FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                color: "#4A7FC1",
                                fontWeight: "bold",
                                fontSize: "28px",
                                border: "2px solid #4A7FC1",
                                borderRadius: "50%",
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            !
                        </div>
                    </div>

                    <h1 className="mb-3" style={{ fontSize: "20px", fontWeight: 600, color: "#333" }}>
                        Verify Your Email
                    </h1>

                    <p className="mb-4" style={{ fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                        A verification link has been sent to your email, follow the instruction to verify your email to
                        continue to tuulbox
                    </p>

                    <Button
                        onClick={handleBackToLogin}
                        style={{
                            backgroundColor: "#102340",
                            color: "white",
                            borderRadius: "10px",
                            padding: "10px 16px",
                            fontSize: "14px",
                            fontWeight: 500,
                            border: "none",
                        }}
                        className="hover-effect"
                    >
                        Back to login
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default VerificationPage;
