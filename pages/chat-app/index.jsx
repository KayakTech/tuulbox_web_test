import { JWT_COOKIE_KEY } from "@/constants";
import { getCookie } from "cookies-next";

const ChatBox = () => {
    const url = new URL(location.href);
    const searchParams = new URLSearchParams(url.search);
    const roomId = searchParams.get("roomID");
    const email = searchParams.get("email");

    return document ? (
        <>
            <ky-chatbox
                room_id={roomId}
                user_email={email}
                chat_host={process.env.NEXT_CHAT_WEBSOCKET_HOST ?? "chat.tuulbox.app"}
                base_url={process.env.NEXT_PUBLIC_API_URL}
                user_token={getCookie(JWT_COOKIE_KEY)}
            />
        </>
    ) : (
        <div></div>
    );
};

export default ChatBox;
