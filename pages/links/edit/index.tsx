import { useRouter } from "next/router";
export default function EditResource() {
    const router = useRouter();
    router.push("/links");
}
