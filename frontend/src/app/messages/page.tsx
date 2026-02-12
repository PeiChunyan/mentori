'use client';

import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';
import { useEffect, useState } from 'react';

// Demo conversation data
const DEMO_CONVERSATIONS = [
  {
    id: 1,
    name: 'Sarah Anderson',
    role: 'mentor',
    avatar: '👩‍💼',
    lastMessage: 'That sounds great! I have availability next Tuesday at 2 PM.',
    timestamp: '2 hours ago',
    unread: true,
    messages: [
      { sender: 'you', text: 'Hi Sarah! I would love to learn more about software architecture.', time: 'Yesterday 3:45 PM' },
      { sender: 'them', text: 'Hi! I\'d be happy to help. What specific areas are you interested in?', time: 'Yesterday 4:12 PM' },
      { sender: 'you', text: 'I\'m particularly interested in microservices and cloud architecture.', time: 'Today 10:30 AM' },
      { sender: 'them', text: 'That sounds great! I have availability next Tuesday at 2 PM.', time: 'Today 12:15 PM' }
    ]
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'mentor',
    avatar: '👨‍💻',
    lastMessage: 'Check out this article on React best practices: https://...',
    timestamp: '1 day ago',
    unread: false,
    messages: [
      { sender: 'you', text: 'Hi Michael! Thanks for connecting.', time: '2 days ago' },
      { sender: 'them', text: 'My pleasure! What brings you to mentoring?', time: '2 days ago' },
      { sender: 'you', text: 'I want to improve my React skills and learn modern best practices.', time: '1 day ago' },
      { sender: 'them', text: 'Check out this article on React best practices: https://...', time: '1 day ago' }
    ]
  },
  {
    id: 3,
    name: 'Emma Korhonen',
    role: 'mentee',
    avatar: '👩‍🎓',
    lastMessage: 'Thank you so much for the advice!',
    timestamp: '3 days ago',
    unread: false,
    messages: [
      { sender: 'them', text: 'Hi! I saw your profile and would love to learn about UX design.', time: '4 days ago' },
      { sender: 'you', text: 'Hello Emma! I\'d be happy to share my experience.', time: '4 days ago' },
      { sender: 'them', text: 'What resources would you recommend for getting started?', time: '3 days ago' },
      { sender: 'you', text: 'Start with "Don\'t Make Me Think" by Steve Krug. It\'s a classic!', time: '3 days ago' },
      { sender: 'them', text: 'Thank you so much for the advice!', time: '3 days ago' }
    ]
  }
];

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const savedUser = authStorage.getUser();
    if (!savedUser) {
      router.push('/auth');
      return;
    }
    setUser(savedUser);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    alert(`Demo mode: Your message "${messageText}" would be sent here!`);
    setMessageText('');
  };

  const selected = selectedConversation !== null 
    ? DEMO_CONVERSATIONS.find(c => c.id === selectedConversation) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-100 border-b-2 border-yellow-300 py-2 px-4 text-center">
        <p className="text-sm text-yellow-800">
          🎭 <strong>DEMO MODE</strong> - This is a demonstration. No real messages are sent or stored.
        </p>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-gray-900 hover:text-blue-600"
          >
            Mentori Network
          </button>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/mentors')}
              className="font-medium text-gray-600 hover:text-gray-900"
            >
              Browse
            </button>
            <button
              onClick={() => {
                authStorage.clear();
                router.push('/auth');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                <p className="text-sm text-gray-500">Demo conversations</p>
              </div>
              <div className="divide-y divide-gray-200">
                {DEMO_CONVERSATIONS.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{conv.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 truncate">{conv.name}</p>
                          {conv.unread && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {conv.role === 'mentor' ? '🎓 Mentor' : '👤 Mentee'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">{conv.timestamp}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
              {selected ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{selected.avatar}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selected.role === 'mentor' ? 'Mentor' : 'Mentee'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {selected.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs ${msg.sender === 'you' ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              msg.sender === 'you'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 px-2">
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message... (Demo only)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Send
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 This is demo mode - messages are not actually sent
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-lg">Select a conversation to view messages</p>
                    <p className="text-sm mt-2">Demo conversations with mentors and mentees</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
