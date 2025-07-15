import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { dataDisplayLayoutActions } from "@/store/data-display-layout";
import { Task, Element3 } from "iconsax-react";

type ListOrGridProps = {
    layoutKey?: any;
};

export default function ListOrGrid({ layoutKey }: ListOrGridProps) {
    const dispatch = useDispatch();
    const { dataDisplayLayout, listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);

    function onLayoutClick(layout: string) {
        // dispatch(dataDisplayLayoutActions.setDataDisplayLayout(layout));
        if (!layoutKey) {
            return;
        }
        dispatch(dataDisplayLayoutActions.setListOrGrid({ layoutKey: layoutKey, value: layout }));
    }

    return (
        <Row>
            <Col>
                <ul className="d-flex list-grid m-0 justify-content-center align-items-center">
                    <li
                        className={`list-grid-item ${
                            // @ts-ignore
                            !listOrGrid[layoutKey] || (layoutKey && listOrGrid[layoutKey] === "list") ? "active" : ""
                        }`}
                        onClick={() => onLayoutClick("list")}
                    >
                        <Task size={24} color="#B0B0B0" />
                    </li>
                    <li
                        // @ts-ignore
                        className={`list-grid-item ${layoutKey && listOrGrid[layoutKey] === "grid" ? "active" : ""}`}
                        onClick={() => onLayoutClick("grid")}
                    >
                        <Element3 size={24} color="#B0B0B0" />
                    </li>
                </ul>
            </Col>
        </Row>
    );
}
