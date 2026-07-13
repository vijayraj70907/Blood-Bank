import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const knowledgeBase = [
  { keywords: ['hello', 'hi', 'hey', 'namaste', 'help'], response: "Hello! 👋 I'm BloodBuddy, your AI assistant. I can help you with:\n\n• Finding blood availability\n• Donor eligibility questions\n• How to request blood\n• Blood compatibility info\n• Emergency procedures\n\nWhat would you like to know?" },
  { keywords: ['eligible', 'eligibility', 'can i donate', 'donate blood'], response: "To donate blood, you must:\n\n✅ Age: 18–65 years\n✅ Weight: Above 50 kg\n✅ Last donation: 90+ days ago\n✅ Hemoglobin: ≥12.5 g/dL\n✅ No recent illness or surgery\n✅ No chronic diseases\n\nUse our **Eligibility Checker** in the Donor dashboard for a detailed assessment!" },
  { keywords: ['emergency', 'urgent', 'critical', 'sos'], response: "🚨 **EMERGENCY BLOOD REQUEST**\n\nFor emergency blood:\n1. Click the red **SOS button** on the homepage\n2. Or call our helpline: **1800-180-0099** (24/7)\n3. Login → Patient Dashboard → Emergency Request\n\nNearby blood banks will be notified instantly! We prioritize all emergency requests." },
  { keywords: ['a+', 'a positive'], response: "**A+ Blood Group:**\n\n• Can donate to: A+, AB+\n• Can receive from: A+, A-, O+, O-\n• Universal recipient from: A- and O-\n\nA+ is one of the most common blood types. Current availability varies by location. Use our search to find nearby stock!" },
  { keywords: ['o-', 'o negative', 'universal donor'], response: "**O- (Universal Donor):**\n\n• Can donate to: ALL blood groups\n• Can receive from: O- only\n\nO- is the most critical blood type needed! It's used in emergencies when the patient's blood group is unknown. O- donors are always in high demand." },
  { keywords: ['ab+', 'ab positive', 'universal recipient'], response: "**AB+ (Universal Recipient):**\n\n• Can donate to: AB+ only\n• Can receive from: ALL blood groups\n\nAB+ individuals can receive blood from any blood group! However, AB+ donors are valuable for platelet donations." },
  { keywords: ['how', 'process', 'procedure', 'steps'], response: "**Blood Donation Process:**\n\n1️⃣ Register as a Donor\n2️⃣ Book an appointment at a nearby blood bank\n3️⃣ Get a health check (BP, Hemoglobin, weight)\n4️⃣ Donate blood (takes ~10 minutes)\n5️⃣ Rest for 15 minutes, have refreshments\n6️⃣ Receive your digital certificate!\n\nThe entire process takes about 45-60 minutes." },
  { keywords: ['safe', 'risk', 'side effect', 'needle'], response: "Blood donation is very safe! 🛡️\n\n• Fresh, sterile needles are always used\n• Your blood volume replenishes in 24-48 hours\n• Red blood cells regenerate in 4-6 weeks\n• Minor side effects: slight dizziness (rare)\n\n**Post-donation tips:**\n• Drink extra fluids\n• Avoid heavy exercise for 24 hours\n• Eat well before and after donation" },
  { keywords: ['certificate', 'reward', 'points', 'badge'], response: "🏆 **Donor Rewards System:**\n\n🥉 Bronze: 1+ donations\n🥈 Silver: 5+ donations\n🥇 Gold: 10+ donations\n💎 Platinum: 20+ donations\n\nEach donation earns you:\n• Points for rewards\n• Digital certificate\n• QR-coded donor ID card\n• Recognition on our donor wall!" },
  { keywords: ['request', 'need blood', 'patient', 'hospital'], response: "**To Request Blood:**\n\n1. Register as a Patient\n2. Login → Patient Dashboard\n3. Fill the Blood Request form:\n   - Blood group needed\n   - Units required\n   - Hospital & doctor details\n   - Upload prescription\n4. Submit — nearby blood banks will respond!\n\nTrack your request status in real-time from your dashboard." },
  { keywords: ['register', 'signup', 'sign up', 'join'], response: "**Registration is easy!**\n\nChoose your role:\n\n🏥 **Blood Bank Owner** — Register your blood bank to manage inventory\n🩸 **Donor** — Sign up to donate and save lives\n🤒 **Patient** — Register to request blood when needed\n\nClick **Register** in the top navigation to get started!" },
  { keywords: ['contact', 'phone', 'email', 'address'], response: "**Contact BloodBridge:**\n\n📞 Helpline: 1800-180-0099 (Toll-free, 24/7)\n📧 Email: info@bloodbridge.in\n🌐 Website: www.bloodbridge.in\n📍 National Blood Transfusion Council, New Delhi\n\nFor medical emergencies, please call 108 (Ambulance)." },
  { keywords: ['blood bank', 'find', 'nearby', 'location'], response: "**Find Blood Banks Near You:**\n\n1. Use the **Search** feature on our homepage\n2. Enter your city, district, or pincode\n3. Filter by blood group availability\n4. View on our interactive map\n5. Get directions with one click!\n\nWe have 2,847+ registered blood banks across India." },
  { keywords: ['stock', 'inventory', 'available units', 'how much'], response: "Blood stock levels vary by location and blood group. To check current availability:\n\n1. Go to our **Search** page\n2. Select your blood group\n3. Enter your location\n4. View real-time stock at each blood bank\n\nStock is updated automatically whenever blood is donated or issued." },
  { keywords: ['appointment', 'book', 'schedule'], response: "**Book a Donation Appointment:**\n\n1. Login to your Donor Dashboard\n2. Click **Book Appointment**\n3. Select a nearby blood bank\n4. Choose your preferred date & time\n5. Confirm — you'll get a reminder!\n\nYou'll receive SMS/email confirmation with all details." },
];

function findResponse(message) {
  const lower = message.toLowerCase();
  for (const item of knowledgeBase) {
    if (item.keywords.some(kw => lower.includes(kw))) {
      return item.response;
    }
  }
  return "I'm not sure about that specific question. Let me suggest:\n\n• **Search** for blood availability by blood group\n• Visit our **FAQ** section\n• Call our helpline: **1800-180-0099**\n• Or email us at **info@bloodbridge.in**\n\nIs there anything else I can help you with? 😊";
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm BloodBuddy 🩸\n\nI can help you with blood availability, donation eligibility, and emergency requests.\n\nHow can I assist you today?",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const quickReplies = [
    'Eligibility check',
    'Emergency blood',
    'Find blood banks',
    'How to donate?',
  ];

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userMsg, time: new Date() }]);
    setTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const response = findResponse(userMsg);
    setTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: response, time: new Date() }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className={`fixed bottom-24 right-6 z-50 chatbot-container rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${minimized ? 'h-14 w-72' : 'w-80 sm:w-96 h-[520px]'}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-700 to-primary-600 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">BloodBuddy AI</p>
                {!minimized && <p className="text-xs text-white/70">Always here to help</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-message flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.type === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <Bot className="w-3.5 h-3.5 text-primary-600" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.type === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700'
                    }`}>
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                      <p className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.type === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ml-2 mt-1">
                        <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}

                {typing && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1.5 items-center">
                      <div className="chat-typing-dot"></div>
                      <div className="chat-typing-dot"></div>
                      <div className="chat-typing-dot"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-3 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-3 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask BloodBuddy..."
                  className="flex-1 px-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400"
                  aria-label="Chat message input"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => { setOpen(!open); setMinimized(false); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-2xl shadow-glow-red-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label={open ? 'Close chat' : 'Open AI chat assistant'}
        aria-expanded={open}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">AI</span>
          </span>
        )}
      </button>
    </>
  );
}
