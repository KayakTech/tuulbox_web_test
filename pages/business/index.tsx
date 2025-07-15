import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/router";

export default function Business() {
    const router = useRouter();
    router.push("/business/company");
}
