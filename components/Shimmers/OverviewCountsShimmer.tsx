import { Col, Placeholder } from "react-bootstrap";

export default function OverviewCountsShimmer() {
    return (
        <>
            <Placeholder as={"p"} animation="glow">
                <Placeholder
                    className=""
                    bg="light"
                    size="lg"
                    style={{ width: "35px", height: "35px", borderRadius: "12px" }}
                />
            </Placeholder>
            <Placeholder as={"p"} animation="glow">
                <Placeholder className="w-50" bg="light" size="lg" style={{}} />
            </Placeholder>
            <Placeholder as={"p"} animation="glow">
                <Placeholder className="w-25" bg="light" size="lg" as={"p"} style={{ height: "43px" }} />
            </Placeholder>
        </>
    );
}
