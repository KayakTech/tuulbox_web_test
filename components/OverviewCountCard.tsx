import { OverviewCount } from "@/types";
import { Card } from "react-bootstrap";
import { User } from "react-feather";

type OverviewCountCardProps = {
    overviewCount: OverviewCount | any;
    index?: number;
};

export default function OverviewCountCard({ overviewCount, index }: OverviewCountCardProps) {
    return (
        <Card className={`border-0`}>
            <Card.Body
                className={`d-flex align-items-center p-0 py-20 ${index != 2 && "pe-24 pl"} pb-24 pl pr ${
                    index != 0 && "ps-24 pr"
                }`}
            >
                <div className="w-100">
                    <div className="d-flex w-100 justify-content-between align-items-start">
                        <p className="text-muted m-0 tb-title-body-medium">{overviewCount.title}</p>
                        <div className="w-40 h-40 border-radius-12 flex-shrink-0 object-fit-cover  border d-flex justify-content-center align-items-center  border-gray-100">
                            <overviewCount.icon size={20} color="#888888" />
                        </div>
                    </div>

                    <span className="tb-title-medium m-0 text-gray-800">{overviewCount.count}</span>
                </div>
            </Card.Body>
        </Card>
    );
}
