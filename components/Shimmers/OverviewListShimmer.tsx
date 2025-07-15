import { Col, Placeholder } from "react-bootstrap";

export default function OverviewListShimmer() {
    return (
        <>
            <Placeholder as={"p"} animation="glow" className="d-flex">
                <Placeholder
                    className=""
                    bg="light"
                    size="lg"
                    style={{ width: "48px", height: "48px", borderRadius: "12px" }}
                />
                <Placeholder as={"p"} animation="glow" className="w-100">
                    <Placeholder className="ms-3 my-auto" bg="light" size="sm" style={{ width: "75px" }} />
                    <br />
                    <Placeholder className="ms-3 my-auto w-50" bg="light" size="sm" style={{ width: "200px" }} />
                </Placeholder>
            </Placeholder>
        </>
    );
}
