const ChatMessageList = ({ messages, className = "", renderMeta }) => {
    return (
        <div className={className}>
        {messages.map((msg) => {
            const isUser = msg.type === "user" || msg.role === "user";

            return (
            <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
                <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    isUser
                    ? "bg-red-600 text-white"
                    : "bg-neutral-800/70 text-neutral-200"
                }`}
                >
                <p>{msg.text}</p>
                {renderMeta?.(msg)}
                </div>
            </div>
            );
        })}
        </div>
    );
};

export default ChatMessageList;