import { MessageCircle } from 'lucide-react';

const ChatFab = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-50"
      title="Chat"
    >
      <MessageCircle size={28} />
    </button>
  );
};

export default ChatFab;
