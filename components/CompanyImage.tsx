import { Iconly } from "react-iconly";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useAccount from "@/hooks/account";

export default function CompanyImage() {
    const { user } = useAccount();
    const { company } = useSelector((state: RootState) => state.business);

    return (
        <div className="d-flex align-items-center">
            <div className="company-profile-image flex-shrink-0 object-fit-cover">
                {!company?.logo ? (
                    <Iconly name="Image" primaryColor="grey" set="light" size={20} />
                ) : (
                    <Image
                        width={40}
                        height={40}
                        src={company.logo || ``}
                        alt="sample-image"
                        className="profile_image flex-shrink-0 object-fit-cover h-100"
                        priority
                    />
                )}
            </div>
        </div>
    );
}
