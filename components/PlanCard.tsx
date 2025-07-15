import React from "react";
import { PlanData, PlanType } from "@/helpers/constants";
import { Button, Card } from "react-bootstrap";

type Props = {
    plan: PlanData;
    currentPlan: PlanType;
};

export const PlanCard: React.FC<Props> = ({ plan, currentPlan }) => {
    return (
        <>
            <Card className="border-radius-16 w-100 py-3" style={{ maxWidth: "832px" }}>
                <div className="px-3 pb-3 d-flex border-bottom border-gray-100 justify-content-between align-items-center">
                    <h4 className="tb-body-large-medium m-0 text-gray-800">Plans and Pricing</h4>
                    {currentPlan !== "freemium" ? (
                        <Button size="sm" variant="secondary" className="ms-2">
                            Upgrade plan
                        </Button>
                    ) : (
                        <Button size="sm" className="ms-2">
                            Upgrade plan
                        </Button>
                    )}
                </div>

                <div className="px-3">
                    <section className="row h-56 border-bottom border-gray-100 align-items-center">
                        <div className="col-6 col-md-2">
                            <p className="tb-body-default-medium text-gray-300 mb-0">Current Plan</p>
                        </div>
                        <div className="col-6 col-md-8">
                            <p className="tb-body-default-medium text-gray-400 mb-0">{plan.name}</p>
                        </div>
                    </section>

                    <section className="row h-56 align-items-center">
                        <div className="col-6 col-md-2">
                            <p className="tb-body-default-medium text-gray-300 mb-0">Price</p>
                        </div>
                        <div className="col-6 col-md-8">
                            <p className="tb-body-default-medium text-gray-400 mb-0">{plan.price}</p>
                        </div>
                    </section>
                </div>
            </Card>
            <Card className="border-radius-16 w-100 pb-3 px-0 mt-4">
                <div className="">
                    <h6 className="p-3">{plan.name} Features</h6>
                    <table className="table table-striped p-0">
                        <tbody className="">
                            {Object.entries(plan.features).map(([key, value]) => (
                                <tr key={key} className="">
                                    <td className="p-3 text-muted border-0">{formatKey(key)}</td>
                                    <td className="border-0 p-3 text-gray-500">
                                        {typeof value === "boolean"
                                            ? value && (
                                                  <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                      strokeWidth="2"
                                                      stroke="currentColor"
                                                      width={18}
                                                      height={18}
                                                  >
                                                      <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          d="m4.5 12.75 6 6 9-13.5"
                                                      />
                                                  </svg>
                                              )
                                            : value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Card className="my-4">
                {currentPlan !== "freemium" && (
                    <section className="d-flex px-3 py-2 justify-content-between align-items-center">
                        <div className="d-flex flex-column gap-1">
                            <h4 className="tb-body-large-medium m-0 text-gray-800">Unsubscribe from plan</h4>
                            <p className="tb-body-small-regular m-0 text-gray-300">
                                You will lose access to the features mentioned above
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="danger"
                            className="btn tb-body-default-medium bg-danger-weak text-danger border-0"
                        >
                            Cancel plan
                        </Button>
                    </section>
                )}
            </Card>
        </>
    );
};

function formatKey(key: string) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
}
