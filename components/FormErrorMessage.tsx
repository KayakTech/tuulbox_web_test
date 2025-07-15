import { ReactHTML } from "react";

export default function FormErrorMessage({ message }: { message: string }) {
    return <p className="text-danger mb-2" dangerouslySetInnerHTML={{ __html: message }}></p>;
}
