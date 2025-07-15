import Image from "next/image";
import useAccount from "@/hooks/account";

export default function ProfileImage() {
    const { user } = useAccount();
    return (
        <div className="d-flex align-items-center">
            <div className="profile-image flex-shrink-0 object-fit-cover me-1 bg-blue-900">
                {!user?.profilePicture ? (
                    <span className="text-gray-200 text-uppercase">
                        {user?.firstName[0]}
                        {user?.lastName[0]}
                    </span>
                ) : (
                    <Image
                        width={40}
                        height={40}
                        src={user?.profilePicture || ``}
                        alt="sample-image"
                        className="profile_image flex-shrink-0 object-fit-cover h-100"
                        priority
                    />
                )}
            </div>
        </div>
    );
}
