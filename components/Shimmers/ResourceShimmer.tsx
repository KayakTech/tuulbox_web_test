import { Card } from "react-bootstrap";
export default function ResourceShimmer() {
    return (
        <>
            <Card className="skeleton">
                <Card.Body>
                    <div className="image border-radius"></div>
                    <div className="pt-3">
                        <div className="line mb-2"></div>
                        <div className="line"></div>
                    </div>
                </Card.Body>
                <Card.Footer className="border-top py-3 bg-transparent">
                    <div className="line x3 border-radius"></div>
                </Card.Footer>
            </Card>
        </>
    );
}
